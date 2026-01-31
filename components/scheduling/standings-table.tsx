'use client';

import { type StandingRow } from '@/lib/actions/scheduling-actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface StandingsTableProps {
  standings: StandingRow[];
}

export function StandingsTable({ standings }: StandingsTableProps) {
  if (standings.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No standings data yet. Record match results to see standings.
      </p>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8">#</TableHead>
            <TableHead>Team</TableHead>
            <TableHead className="text-center">W</TableHead>
            <TableHead className="text-center">L</TableHead>
            <TableHead className="text-center">D</TableHead>
            <TableHead className="text-center">PF</TableHead>
            <TableHead className="text-center">PA</TableHead>
            <TableHead className="text-center">Diff</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {standings.map((row, idx) => (
            <TableRow key={row.teamId}>
              <TableCell className="font-medium">{idx + 1}</TableCell>
              <TableCell className="font-semibold">{row.teamName}</TableCell>
              <TableCell className="text-center">{row.wins}</TableCell>
              <TableCell className="text-center">{row.losses}</TableCell>
              <TableCell className="text-center">{row.draws}</TableCell>
              <TableCell className="text-center">{row.pointsFor}</TableCell>
              <TableCell className="text-center">{row.pointsAgainst}</TableCell>
              <TableCell className="text-center font-medium">
                <span className={row.diff > 0 ? 'text-green-600' : row.diff < 0 ? 'text-red-600' : ''}>
                  {row.diff > 0 ? '+' : ''}{row.diff}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
