"use client";

import { useQuery } from "@tanstack/react-query";

import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import apiURL from "@/APIurl";
const accountBaseURL = apiURL + "/account/account_id/";
const tranasctionsBaseURL = apiURL + "/transaction/account_id/";

export default function Account({ params }) {
  const account_id = params.account;

  const account = useQuery({ queryKey: [accountBaseURL, account_id] });
  const transactions = useQuery({
    queryKey: [tranasctionsBaseURL, account_id],
  });

  return (
    <Container style={{ minHeight: "100vh" }}>
      <Paper sx={{ p: 2, margin: 2, flexGrow: 1 }}>
        <div color="primary">
          {account.isSuccess && (
            <div>
              <Typography variant="h5" component="div">
                Account Number: {account.data.account_id}
              </Typography>
              <Typography
                sx={{ fontSize: 14 }}
                color="text.secondary"
                gutterBottom
              >
                Limit: ${account.data.limit}
              </Typography>
              <Typography>Products:</Typography>
              {account.data.products.map((product) => (
                <div key={product}>
                  <Typography
                    sx={{ fontSize: 14 }}
                    color="text.secondary"
                    gutterBottom
                  >
                    {product.replace(/([A-Z])/g, " $1").trim()}
                  </Typography>
                </div>
              ))}
            </div>
          )}
          {account.isLoading && (
            <Grid
              container
              spacing={0}
              direction="column"
              alignItems="center"
              justifyContent="center"
            >
              <CircularProgress color="success" />
            </Grid>
          )}
        </div>
      </Paper>
      <Paper sx={{ p: 2, margin: 2, flexGrow: 1 }}>
        <div color="primary">
          {transactions.isSuccess && (
            <div>
              <TableContainer component={Paper} sx={{ fontSize: 4 }}>
                <Table aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Symbol</TableCell>
                      <TableCell align="right"></TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="right">Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.data.transactions.map((row) => (
                      <TableRow
                        key={row.name}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {row.symbol}
                        </TableCell>
                        <TableCell align="right">
                          {row.transaction_code}
                        </TableCell>
                        <TableCell align="right">{row.amount}</TableCell>
                        <TableCell align="right">
                          {Number(row.price).toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          {Number(row.total).toFixed(2)}
                        </TableCell>
                        <TableCell align="right">{row.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}
          {account.isLoading && (
            <Grid
              container
              spacing={0}
              direction="column"
              alignItems="center"
              justifyContent="center"
            >
              <CircularProgress color="success" />
            </Grid>
          )}
        </div>
      </Paper>
    </Container>
  );
}
