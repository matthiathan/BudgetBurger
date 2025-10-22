'use client';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUser } from "@/firebase";

export function AccountForm() {
    // This would use react-hook-form and a server action in a real app.
    const { user } = useUser();

    return (
      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" defaultValue={user?.displayName || ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" defaultValue={user?.email || ""} />
        </div>
        <Button>Save changes</Button>
      </form>
    )
  }