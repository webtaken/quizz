import Link from "next/link";
import { ReactNode } from "react";
import { Button } from "./ui/button";

export default function Account({
  text,
  link,
  logo,
}: {
  text: string;
  link: string;
  logo: ReactNode;
}) {
  return (
    <Button variant="link" asChild>
      <Link href={link} className="flex items-center gap-x-1" target="_blank">
        {logo} {text}
      </Link>
    </Button>
  );
}
