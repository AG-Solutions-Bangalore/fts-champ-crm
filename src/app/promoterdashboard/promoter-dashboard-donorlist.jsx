import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const DonorMembersTable = ({ data = [], selectedType }) => {
  const [search, setSearch] = useState("");

  const { rows, years } = useMemo(() => {
    if (!selectedType) return { rows: [], years: [] };

    const filtered = data.filter(
      (d) => d.receipt_donation_type === selectedType,
    );

    const map = {};
    const yearSet = new Set();

    filtered.forEach((item) => {
      const id = item.indicomp_fts_id;
      const year = item.receipt_financial_year.split("-")[0];
      const amount = Number(item.total_amount);

      yearSet.add(year);

      if (!map[id]) {
        map[id] = {
          name: item.indicomp_full_name,
          type: item.indicomp_type,
          mobile: item.indicomp_mobile_phone,
        };
      }

      map[id][year] = (map[id][year] || 0) + amount;
    });

    const years = Array.from(yearSet).sort();
    const rows = Object.values(map);

    return { rows, years };
  }, [data, selectedType]);

  const filteredRows = rows.filter((row) =>
    row.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Card className="px-4 py-3">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">
            Donors -{selectedType || ""}
          </CardTitle>

          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search donors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
        </div>
      </CardHeader>

      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>

              {years.map((year) => (
                <TableHead key={year} className="text-center">
                  {year}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredRows.length ? (
              filteredRows.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {row.name} ({row.type})
                      </span>
                      <span className="text-xs text-gray-500">
                        {row.mobile}
                      </span>
                    </div>
                  </TableCell>
                  {years.map((year) => (
                    <TableCell key={year} className="text-center">
                      ₹ {row[year] ?? 0}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={years.length + 1}
                  className="text-center py-6"
                >
                  No donors found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default DonorMembersTable;
