'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type Team } from '@/lib/db/schema';
import { addTeam, removeTeam } from '@/lib/actions/scheduling-actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface TeamListEditorProps {
  leagueId: string;
  teams: Team[];
}

export function TeamListEditor({ leagueId, teams }: TeamListEditorProps) {
  const router = useRouter();
  const [newTeamName, setNewTeamName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!newTeamName.trim()) return;
    setIsAdding(true);
    const result = await addTeam({ leagueId, name: newTeamName.trim() });
    if (result.success) {
      toast.success('Team added');
      setNewTeamName('');
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsAdding(false);
  };

  const handleRemove = async (teamId: string) => {
    const result = await removeTeam({ id: teamId });
    if (result.success) {
      toast.success('Team removed');
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="New team name"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="h-9"
        />
        <Button size="sm" onClick={handleAdd} disabled={isAdding || !newTeamName.trim()}>
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </div>
      <div className="space-y-1">
        {teams.map((team, i) => (
          <div key={team.id} className="flex items-center justify-between rounded-md border px-3 py-2">
            <span className="text-sm">
              <span className="text-muted-foreground mr-2">{i + 1}.</span>
              {team.name}
            </span>
            <Button variant="ghost" size="sm" onClick={() => handleRemove(team.id)} className="text-destructive h-7">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
