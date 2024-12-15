
import Link from "next/link";
import { useMemo, useState } from "react";
import BillCard from "~/components/bills/billcard";
import Header from "~/components/header";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

const billsData = [
  { customerName: "Shri Ganeshvostava Samithi", price: 1200, date: "2024-12-15T10:00:00Z" },
  { customerName: "Ajekar Scanks", price: 750, date: "2024-12-14T14:30:00Z" },
  { customerName: "Wddding", price: 2000, date: "2024-12-13T09:15:00Z" },
];

export default function Home() {
  const [bills,] = useState(billsData);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBills = useMemo(() => {
    return bills.filter((bill) =>
      bill.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [bills, searchTerm]);
  return (
    <>
      <div className="w-full h-full p-12">
        <Header
          title="Invoice Bills"
          subtitle="Browse your All Bills"
          rightElement={
            <div className="flex flex-row items-center justify-between gap-4">
              <div>
                <Input
                  type="text"
                  placeholder="Search Bills..."
                  className="font-sora text-black border border-black"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <Link href="/create">
                  <Button className=" bg-neutral-800 font-sora" >
                    Create New Bill
                  </Button>
                </Link>
              </div>
            </div>

          }
        />
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
            {filteredBills.length > 0 ? (
              filteredBills.map((bill, idx) => (
                <BillCard
                  key={idx}
                  customerName={bill.customerName}
                  price={bill.price}
                  date={bill.date}
                />
              ))
            ) : (
              <div className="col-span-full text-center text-lg text-gray-500 font-grotesk">
                No Bills Available
              </div>
            )}
          </div>

        </div>


      </div>


    </>
  );
}
