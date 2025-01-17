"use client"
// Module import
import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography,
  Button,
  TableHead,
  Container,
  Grid,
  NoSsr
} from '@mui/material';
import { motion } from 'framer-motion';
// [To Do] Replaced by a real user ID
const owner_id = "user1";
// Main style of table
const stylePane =
  "bg-black sm:border border-neutral-800 flex-auto sm:rounded-2xl h-screen shadow-xl p-4 overflow-auto scrollbar-hide pb-32 transition-all";
// Main Code of Portfolio Component
export default function Portfolio() {
  // UseStates
  const [isSellPopupOpen, setIsSellPopupOpen] = useState(false);
  const [netProfitLoss, setNetProfitLoss] = useState(0);
  const [sharesToSell, setSharesToSell] = useState<any>({});
  const [intervalMs, setIntervalMs] = useState(1000);
  const [searchResults, setSearchResults] = useState([]);
  // Framer motions
  const tableVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } },
    exit: { opacity: 0 },
  };

  const rowVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  };
  // [Function] Fetch a single stock price
  const fetchStockPrice = async (symbol: String) => {
    try {
      const response = await fetch(`/api/stocks/quote/${symbol}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch stock price for ${symbol}`);
      }
      const data = await response.json();
      return data.c;
    } catch (error) {
      console.error(error);
      return null;
    }
  };
  
  // [UseQuery and Related Functions]
  // [Function] Fetch whole asset of a user
  const fetchUserPortfolio = async () => {
    const response = await fetch(`/api/simulation/portfolio/${owner_id}`);
    const data = await response.json();
    const formattedAssets = data.map((asset: { _id: any; ticker: any; asset_name: any; quantity: any; purchase_price: any; purchase_date: any; }) => {
      return {
        id: asset._id,
        symbol: asset.ticker,
        name: asset.asset_name,
        shares: asset.quantity,
        purchasePrice: asset.purchase_price,
        purchaseDate: asset.purchase_date,
      };
    });
    return formattedAssets;
  };
  // [UseQuery] Retrieve the data to purchasedStocks
  const {
    data: purchasedStocks,
    isLoading: isLoadingPurchasedStocks,
    isError: isErrorPurchasedStocks,
    refetch: refetchPurchasedStocks,
  } = useQuery(["purhcasedStocks"], fetchUserPortfolio, {
    initialData: [],
    refetchOnWindowFocus: false,
  });

  // [Function] Fetch stock prices of purchasedStocks[aka. asset]
  const fetchStockPrices = async (purchasedStocks: any[]) => {
    const requests = purchasedStocks.map((stock) => {
      return fetch(`/api/stocks/quote/${stock.symbol}`);
    });
    const responses = await Promise.all(requests);
    const prices = await Promise.all(
      responses.map((response) => response.json())
    );
    const result = prices.reduce((accumulator, price, index) => {
      const symbol = purchasedStocks[index].symbol;
      accumulator[symbol] = price.c;
      return accumulator;
    }, {});
    return result;
  }
  // [UseQuery] Retrieve the data to stockPrices
  const {
    data: stockPrices,
    refetch: refetchStockPrices,
  } = useQuery(["stockPrices", purchasedStocks.map((stock: { symbol: any; }) => stock.symbol)], () => fetchStockPrices(purchasedStocks),
    {
      refetchInterval: intervalMs,
      refetchOnWindowFocus: false,
      onSuccess: () => updateNetProfitLoss(),
    });
  console.log("Stock prices from useQuery:", stockPrices);
  
  // [Function] Fetch Profit/Loss from MongoDB's pastprofitLoss
  const fetchPastProfitLoss = async () => {
    const response = await fetch(`/api/simulation/profit/${owner_id}`);
    const data = await response.json();
    return data;
  };
  // [UseQuery] Retrieve the data to pastProfitLoss
  const {
    data: pastProfitLoss,
    isLoading: isLoadingPastProfitLoss,
    isError: isErrorPastProfitLoss,
    refetch: refetchPastProfitLoss,
  } = useQuery(["pastProfitLoss"], fetchPastProfitLoss, {
    initialData: 0,
    refetchOnWindowFocus: false,
  });

  // [Function] update net profit and loss [aka. Unrealized profit]
  const updateNetProfitLoss = () => {
    let net = 0;
    purchasedStocks.forEach((stock: { symbol: string; purchasePrice: number; shares: number; }) => {
      const stockPrice = stockPrices && typeof stock.symbol === 'string' ? stockPrices[stock.symbol] : undefined;
      // In the case stockInfo is not defined, throw an error
      if (!stockPrice) {
        console.log(`Stock with symbol ${stock.symbol} not found`);
      }
      net += (stockPrice - stock.purchasePrice) * stock.shares;
    });
    setNetProfitLoss(net);
  };

  // [Function] Sell a stock
  const handleStockSell = async (stockToSell: any, sharesToSell: any) => {
    if (!stockToSell || !sharesToSell) {
      console.error('Stock or shares not provided');
      return;
    }
    const stockPrice = await fetchStockPrice(stockToSell.symbol);
    if (!stockPrice) {
      throw new Error(`Stock with symbol ${stockToSell.symbol} not found`);
    }
    const payload = {
      owner_id: 'user1', // To do
      ticker: stockToSell.symbol,
      quantity: parseInt(sharesToSell),
      sell_price: stockPrice,
      asset_id: stockToSell.id,
    };
    const response = await fetch('/api/simulation/sell', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      const updatedPortfolio = await response.json();
      refetchPurchasedStocks();
      refetchPastProfitLoss();
      updateNetProfitLoss();
      refetchStockPrices();
    } else {
      console.error('Error selling stock', await response.json());
    }
  };
  // Page Construction
  return (
    <div className="container max-w-5xl sm:px-8 mx-auto flex-auto">
      <Grid justifyContent="center" style={{ textAlign: 'center' }}>
      <motion.div initial={{ y: -20 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}>
        <Container style={{ padding: 20 }}>
          <div>
            <Typography variant="h3">
              <strong className="text-4xl text-white">
                Profit: <span style={{ color: pastProfitLoss > 0 ? 'green' : pastProfitLoss < 0 ? 'red' : '' }}>
                  ${isNaN(pastProfitLoss) ? '0.00' : pastProfitLoss.toFixed(2)}
                </span>
              </strong>
            </Typography>
          </div>
          <div>
            <Typography variant="h4" ><strong className="text-4xl text-white">Unrealized: <span style={{ color: netProfitLoss > 0 ? 'green' : netProfitLoss < 0 ? 'red' : '' }}>${netProfitLoss.toFixed(2)}</span></strong></Typography>
          </div>
        </Container>
      </motion.div>
      </Grid>
      
      <motion.div variants={tableVariants} initial="initial" animate="animate" exit="exit">

      <Grid container justifyContent="space-between" style={{ marginBottom: '20px' }}>
        <Link href="/dashboard/simulation/transhistory" passHref>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Button color="secondary" sx={{ position: 'relative' }}>
              View Transaction History
            </Button>
          </motion.div>
        </Link>
        <Link href="/dashboard/simulation/buy" passHref>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Button color="secondary" sx={{ position: 'relative' }}>
              Buy a new stock
            </Button>
          </motion.div>
        </Link>
      </Grid>

      <div className={stylePane}>
      <NoSsr>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>ID</TableCell>
              <TableCell sx={{ display: { xs: 'table-cell', sm: 'none' } }}>
                Sym
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                Symbol
              </TableCell>
              <TableCell sx={{ display: { xs: 'table-cell', sm: 'none' } }}>
                No.
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                Shares
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Purchase Price</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Current Price</TableCell>
              <TableCell sx={{ display: { xs: 'table-cell', sm: 'none' } }}>
                Earn
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                Profit
              </TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Purchase Date</TableCell>
              <TableCell>
                Sell Num
              </TableCell>
              <TableCell ></TableCell>
            </TableRow>
          </TableHead>
          <motion.tbody variants={tableVariants}>
   
            {purchasedStocks.map((stock: any) => {
              const stockPrice = stockPrices && typeof stock.symbol === 'string' ? stockPrices[stock.symbol] : undefined;
              const stockWithCurrentPrice = { ...stock, currentPrice: stockPrice };
              return (
                <motion.tr key={stock.symbol} variants={rowVariants}>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    {stock.id.slice(-3)}
                  </TableCell>
                  <TableCell >{stock.symbol}</TableCell>
                  <TableCell >{stock.shares}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>${stock.purchasePrice}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    {stockPrice ? `$${stockPrice}` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {stockPrice
                      ? `$${((Number(stockPrice) - Number(stock.purchasePrice)) * Number(stock.shares)).toFixed(2)}`
                      : 'N/A'}
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{stock.purchaseDate}</TableCell>
                  <TableCell sx={{ display: {xs: 'none', sm:'table-cell'} }}>
                    <TextField
                      type="number"
                      inputProps={{ min: 0, max: stock.shares }}
                      value={sharesToSell[stock.id] || 0}
                      onChange={(e) => setSharesToSell({ ...sharesToSell, [stock.id]: parseInt(e.target.value) })}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                        sx={{ display: {sm: 'none' } }}
                        type="number"
                        inputProps={{ min: 0, max: stock.shares }}
                        value={sharesToSell[stock.id] || 0}
                        onChange={(e) => setSharesToSell({ ...sharesToSell, [stock.id]: parseInt(e.target.value) })}
                        fullWidth
                      />
                    <Button size="small" onClick={() => handleStockSell(stock, sharesToSell[stock.id])}>
                      Sell
                    </Button>
                  </TableCell>
                </motion.tr>
              );
            })}
             
 
          </motion.tbody>
        </Table>
        </NoSsr>
      </div>
      </motion.div>
    </div>
  );

}
