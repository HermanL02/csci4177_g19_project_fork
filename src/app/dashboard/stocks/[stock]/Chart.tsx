/**Author: Olexiy Prokhvatylo B00847680 */

"use client";

import { Line } from "react-chartjs-2";
import { memo, useState } from "react";
import dynamic from "next/dynamic";
import type { iCandle, iQuote } from "@/types/iStocks";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

const Tabs = dynamic(() => import("./Tabs"));

const chartTimeframes = ["1D", "1W", "1M", "6M", "1Y"];

function formatLabels(labels: number[], timeframe: number) {
  if (!labels) return [];
  switch (timeframe) {
    case 0:
      return labels.map((timestamp) => {
        return dayjs(timestamp * 1000).format("ddd HH:mm");
      })
    case 1:
      return labels.map((timestamp) => {
        return dayjs(timestamp * 1000).format("ddd D, HH:mm");
      })
    default:
      return labels.map((timestamp) => {
        return dayjs(timestamp * 1000).format("D MMM YY");
      })
  }
}

function StockChart(props: { symbol: string; quote: iQuote }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState(0);

  const points = useQuery<iCandle>({
    queryKey: ["/api/stocks/hist/", `${chartTimeframes[selectedTimeframe]}/`, props.symbol],
    retry: true,
    retryDelay: 1000,
    placeholderData: { c: [], d: [], o: [], t: [], s: "no_data" },
  });

  if (!points.data || (!points.isFetching && points.data.s !== "ok")) { return (<> </>) }

  const lineColor =
    selectedTimeframe === 0
      ? (props.quote.d > 0 ? "rgba(74, 222, 128, 1)" : "rgba(248, 113, 113, 1)")
      : (points.data.c[points.data.c.length - 1] - points.data.c[0] > 0 ? "rgba(74, 222, 128, 1)" : "rgba(248, 113, 113, 1)");

  return (
    <>
      <div
        className={
          `relative z-10 h-56 w-full rounded-xl border border-neutral-800 bg-gradient-to-bl p-1 shadow-2xl md:h-64 lg:h-72 2xl:h-80 2xl:p-2 `
          + (selectedTimeframe === 0
            ? (props.quote.d > 0
              ? "from-green-300/[0.2] via-green-100/[0.09] to-green-100/[0.09] shadow-green-300/[0.17] "
              : "from-red-300/[0.2] via-red-100/[0.09] to-red-100/[0.09] shadow-red-300/[0.17] ")
            : (points.data.c[points.data.c.length - 1] - points.data.c[0] > 0
              ? "from-green-300/[0.2] via-green-100/[0.09] to-green-100/[0.09] shadow-green-300/[0.17] "
              : "from-red-300/[0.2] via-red-100/[0.09] to-red-100/[0.09] shadow-red-300/[0.17] ")
          )
        }
      >
        <Line
          data={{
            labels: formatLabels(points.data.t, selectedTimeframe),
            datasets: [
              {
                label: "Price",
                data: points.data.c,
                borderColor: lineColor,
                borderWidth: 3,
                spanGaps: true,
                normalized: true,
                tension: 0.1,
              },
            ],
          }}
          options={{
            maintainAspectRatio: false,
            interaction: {
              mode: "nearest",
              axis: "x",
            },
            elements: {
              point: {
                pointStyle: "cross",
                hoverRadius: 15,
                radius: 0,
                hoverBorderWidth: 2,
                hitRadius: 400,
                hoverBackgroundColor: "white",
                hoverBorderColor: "white",
              },
            },
            plugins: {
              legend: {
                display: false,
              },
              annotation: {
                common: {
                  drawTime: "beforeDatasetsDraw",
                },
                annotations: {
                  line1: {
                    type: "line",
                    yMin: props.quote.o,
                    yMax: props.quote.o,
                    borderColor: "rgba(255,255,255,0.4)",
                    borderWidth: 1.5,
                    borderDash: [10, 10],
                  },
                },
              },
            },
            scales: {
              y: {
                display: true,
                ticks: {
                  display: true,
                  padding: 8,
                  maxTicksLimit: 5,
                  color: "rgba(255,255,255,0.6)",
                  font: {
                    size: 12,
                    weight: "500",
                  },
                },
                grid: {
                  color: "rgba(255,255,255,0.12)",
                  lineWidth: 0.5,
                },
              },
              x: {
                display: true,
                offset: true,
                ticks: {
                  display: true,
                  maxTicksLimit: 6,
                  maxRotation: 0,
                  padding: 6,
                  //labelOffset: 24,
                  color: "rgba(255,255,255,0.3)",
                  font: {
                    size: 10,
                    weight: "400",
                  },
                },
                grid: {
                  color: "rgba(255,255,255,0.12)",
                  lineWidth: 0.5,
                },
              },
            },
          }}
        />
      </div>

      <Tabs
        selector={[selectedTimeframe, setSelectedTimeframe]}
        components={chartTimeframes}
        className="my-1 px-8 lg:px-12 xl:my-2"
      />
    </>
  );
}

export default memo(StockChart);
