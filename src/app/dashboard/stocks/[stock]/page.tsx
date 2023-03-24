"use client";

import { useState } from "react";
import { queryClient } from "@/app/QueryProvider";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { useMutation, useQuery } from "@tanstack/react-query";
import { TrashIcon, PlusIcon } from "@heroicons/react/24/solid";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { iQuote, iProfile, iCompanyNews } from "@/utils/types/iStocks";

// Lazy load
const Chart = dynamic(() => import("./Chart"));
const NotFound = dynamic(() => import("../../[404]/page"));

export default function StockDetails({
  params,
}: {
  params: { stock: string };
}) {
  const quote = useQuery<iQuote>({
    queryKey: [`/api/stocks/quote/`, params.stock],
  });
  const profile = useQuery<iProfile>({
    queryKey: [`/api/stocks/profile/`, params.stock],
    staleTime: Infinity,
  });
  const userStocks = useQuery<string[]>({
    queryKey: [`/api/stocks/user`],
  });
  const companyNews = useQuery<iCompanyNews[]>({
    queryKey: [`/api/stocks/company-news/`, params.stock]
  });
  const [newsLimit, setNewsLimit] = useState(3);
  const isAdded =
    userStocks.isSuccess && userStocks.data.includes(params.stock);

  // Function to update user stock list
  // Implements optimistic updates
  const userStocksMut = useMutation({
    mutationFn: ((newList: string[]) =>
      fetch(`/api/stocks/user`, {
        method: "POST",
        body: JSON.stringify(newList),
        headers: { "Content-Type": "application/json" },
      })),
    // When mutate is called:
    onMutate: async (newList) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["/api/stocks/user"] });

      // Snapshot the previous value
      const previousList = queryClient.getQueryData(["/api/stocks/user"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["/api/stocks/user"], () => newList);

      // Return a context object with the snapshotted value
      return { previousList };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (context: { previousList: string[] }) => {
      queryClient.setQueryData(["/api/stocks/user"], context.previousList);
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stocks/user"] });
    },
  });

  if (quote.isSuccess && quote.data.c === 0 && quote.data.d === null) {
    return <NotFound />;
  }

  return (quote.isSuccess &&
    <>
      <div className="w-[calc(100%) + 0.5rem] sticky top-0 z-50 -mx-8 -my-5 hidden h-10 -translate-y-8 rounded-2xl bg-gradient-to-b from-black to-transparent p-4 pb-0 sm:block" />
      <div className="w-full overflow-auto pb-6 transition-all scrollbar-hide">
        <nav className="flex w-full items-center justify-between pb-6 sm:hidden">
          <Link href={"/dashboard/stocks/"}>
            <ArrowLeftIcon className="h-9 w-9 rounded-md bg-white/[0.1] p-2" />
          </Link>
          {userStocks.isSuccess && isAdded && (
            <button
              className="rounded-md bg-white/[0.1] p-2 hover:bg-rose-400 hover:text-black"
              onClick={() =>
                userStocksMut.mutate([
                  ...userStocks.data.filter((item: string) => {
                    return item !== params.stock;
                  }),
                ])
              }
            >
              <TrashIcon className="w-4" />
            </button>
          )}
          {userStocks.isSuccess && !isAdded && (
            <button
              className="rounded-md bg-white/[0.1] p-2 hover:bg-green-400 hover:text-black"
              onClick={() =>
                userStocksMut.mutate([...userStocks.data.concat(params.stock)])
              }
            >
              <PlusIcon className="w-4" />
            </button>
          )}
        </nav>

        <section className="flex w-full justify-between gap-2">
          <div className="text-scroll flex-auto overflow-auto scrollbar-hide">
            <section className="flex items-end gap-4">
              <h2 className="text-xl font-extrabold">{params.stock}</h2>
              {profile.isSuccess && (
                <h2 className="whitespace-nowrap text-neutral-400">
                  {profile.data.exchange && profile.data.exchange.split(" ")[0]}{" "}
                  · {profile.data.currency}
                </h2>
              )}
            </section>

            <h1 className="max-w-[200px] whitespace-nowrap text-3xl sm:max-w-full">
              {(profile.isSuccess && profile.data.name) || <br />}
            </h1>
          </div>

          <div className="text-end">
            <h1 className="text-xl font-extrabold leading-8 group-hover:text-neutral-50">
              {quote.isSuccess && quote.data.c}
            </h1>
            {quote.isSuccess && (
              <p
                className={
                  "text-lg font-medium " +
                  (quote.data.d > 0 ? "text-green-400" : "text-red-400")
                }
              >
                {quote.data.d > 0 ? `+${quote.data.d}` : `${quote.data.d}`}
              </p>
            )}
          </div>
        </section>
      </div>

      {params.stock && quote.isSuccess && (
        <Chart symbol={params.stock} quote={quote.data} />
      )}

      {companyNews.isSuccess &&
        <section className={"mt-6 text-neutral-100 transition-all"}>
          <h1 className="text-xl font-bold">Related News</h1>
          <div className="mt-4 flex flex-col gap-3">
            {companyNews.data.slice(0, newsLimit).map((story: iCompanyNews) => (
              <a
                key={story.id}
                href={story.url}
                rel="noopener noreferrer"
                target="_blank"
              >
                <article className="relative flex h-28 cursor-pointer items-center gap-4 rounded-xl border border-neutral-800 bg-white/[0.05] p-2 hover:border-neutral-700">
                  <div className="h-full w-32 rounded-lg bg-white/[0.1] shrink-0" />
                  <div className="h-full py-1 pr-4 w-10 flex-1">
                    <h1 className="font-semibold max-w-prose truncate">{story.headline}</h1>
                    <p className="text-sm text-neutral-400 h-10 max-w-prose text-ellipsis line-clamp-2">{story.summary}</p>
                  </div>
                </article>
              </a>
            ))}
          </div>
        </section>
      }

      {
        companyNews.isSuccess && companyNews.data.length > newsLimit && (
          <div className="flex mt-6 w-full flex-col items-center justify-center">
            <button
              className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm font-medium active:opacity-70"
              onClick={() => setNewsLimit(newsLimit + 2)}
            >
              Show more stories
            </button>
          </div>
        )
      }
    </>
  );
}
