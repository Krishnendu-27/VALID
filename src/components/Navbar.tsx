import { ScanLine, Menu, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Image } from "@/assets/Image";
import { Link } from "react-router-dom";

interface NavItemsType {
  href: string;
  name: string;
}

const NavItems: NavItemsType[] = [
  {
    href: "#how-it-works",
    name: "How It Works",
  },
  {
    href: "#features",
    name: "Features",
  },
  {
    href: "#compliance",
    name: "Compliance",
  },
  {
    href: "#reports",
    name: "Reports",
  },
];

export const Navbar = () => (
  <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-border transition-all">
    <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
      <div className="flex items-center">
        <img
          src={Image.Logo}
          alt="Logo"
          className="h-13 w-auto object-contain"
        />
      </div>

      <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-muted-foreground">
        <Link to={"/home"} className="hover:text-foreground transition-colors">
          Home
        </Link>
        {NavItems.map((navitem) => {
          return (
            <a
              key={navitem.href}
              href={navitem.href}
              className="hover:text-foreground transition-colors"
            >
              {navitem.name}
            </a>
          );
        })}
      </div>

      <div className="hidden md:flex items-center space-x-4">
        <Link to={"/login"}>
          <Button variant="outline" className="w-full">
            Login
          </Button>
        </Link>
        <Button>
          Start Scanning <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <Sheet>
        {/* <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger> */}

        <SheetTrigger className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </SheetTrigger>

        <SheetContent
          side="right"
          className="w-[300px] sm:w-[360px] flex flex-col px-6"
        >
          <nav className="flex flex-col gap-1 pt-4">
            <Link
              to={"/home"}
              className="flex items-center rounded-lg px-3 py-3
            text-sm font-medium
            text-muted-foreground
            transition-colors
            hover:bg-muted
            hover:text-foreground"
            >
              Home
            </Link>
            {NavItems.map((navitem) => (
              <a
                key={navitem.href}
                href={navitem.href}
                className="
            flex items-center rounded-lg px-3 py-3
            text-sm font-medium
            text-muted-foreground
            transition-colors
            hover:bg-muted
            hover:text-foreground
          "
              >
                {navitem.name}
              </a>
            ))}
          </nav>
          <div className="mt-auto border-t pt-5 pb-2 space-y-3">
            <Link to="/login" className="block">
              <Button variant="outline" className="w-full h-11">
                Login
              </Button>
            </Link>

            <Button className="w-full h-11">
              <ScanLine className="mr-2 h-4 w-4" />
              Start Scanning
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  </nav>
);