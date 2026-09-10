import { Image } from "@/assets/Image";

export const Footer = () => (
  <footer className="bg-background border-t border-border pt-16 pb-8">
    <div className="container mx-auto px-4 md:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
        <div className="col-span-2 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              <img
                src={Image.Logo}
                alt="Logo"
                className="h-13 w-auto object-contain"
              />
            </div>
          </div>
          <p className="text-muted-foreground text-sm max-w-xs">
            AI-assisted packaged commodity compliance screening platform for
            modern regulatory enforcement.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-foreground">Product</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="#" className="hover:text-foreground">
                Home
              </a>
            </li>
            <li>
              <a href="#how-it-works" className="hover:text-foreground">
                How It Works
              </a>
            </li>
            <li>
              <a href="#features" className="hover:text-foreground">
                Features
              </a>
            </li>
            <li>
              <a href="#reports" className="hover:text-foreground">
                Dashboard
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-foreground">Compliance</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="#compliance" className="hover:text-foreground">
                Compliance Checks
              </a>
            </li>
            <li>
              <a href="#reports" className="hover:text-foreground">
                Reports
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-foreground">
                Evidence
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-foreground">Platform</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="#" className="hover:text-foreground">
                Login
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-foreground">
                Documentation
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-foreground">
                Support
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} PackVerify. All rights reserved.</p>
        <p>AI-assisted compliance screening platform.</p>
      </div>
    </div>
  </footer>
);