import dynamic from "next/dynamic";
import Transition from "./Transition";
import type { Metadata } from "next";
import UIWrap from "./UIWrap";

const NavDesktop = dynamic(() => import("./NavDesktop"));
const NavMobile = dynamic(() => import("./NavMobile"));

export const metadata: Metadata = {
  title: "Dashboard - StockVision",
  description: "Your personal dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <UIWrap />
      <div className="text-neutral-100 md:ml-16">
        <Transition>{children}</Transition>
      </div>
    </>
  );
}
