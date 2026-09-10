import {
  ScanLine,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Cpu,
  FileBarChart,
  Lock,
  UserCheck,
  Layers,
  FileImage,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

import Autoplay from "embla-carousel-autoplay";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Image } from "@/assets/Image";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const scannerImages = [Image.Logo, Image.LoadingLogo];

const Hero = () => (
  <section
    id="home"
    className="container mx-auto px-4 md:px-8 py-12 md:py-10 flex flex-col lg:flex-row items-center gap-12"
  >
    <div className="flex-1 flex flex-col items-start space-y-6">
      <Badge
        variant="secondary"
        className="px-3 py-1 font-medium tracking-wide bg-primary/10 text-primary hover:bg-primary/20"
      >
        AI-ASSISTED COMPLIANCE SCREENING
      </Badge>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
        <span className="block">Automated Compliance Checking</span>
        <span className="block">for Packaged Commodities</span>
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
        Scan product labels and packaging with AI-assisted image analysis to
        extract mandatory declarations, validate compliance requirements, and
        identify potential violations in seconds.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
        <Button size="lg" className="h-12 px-8 text-base">
          <ScanLine />
          Start Scanning
        </Button>
        <Button size="lg" variant="outline" className="h-12 px-8 text-base">
          Explore How It Works
        </Button>
      </div>
    </div>

    {/* Image Carousel */}

    <div className="flex w-full max-w-[420px] lg:w-[460px] items-center justify-center">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-2xl w-full max-w-[340px] lg:max-w-[380px]">
        <Carousel
          opts={{
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 2000,
              stopOnInteraction: false,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent className="flex">
            {scannerImages.map((image, index) => (
              <CarouselItem key={image} className="w-full">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl flex items-center justify-center bg-muted/30">
                  <img
                    src={image}
                    alt={`Packaged commodity ${index + 1}`}
                    className="h-full w-full object-contain"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  </section>
);

const CapabilityStrip = () => (
  <section className="border-y border-border bg-muted/20">
    <div className="container mx-auto px-4 md:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: Search,
            title: "AI-Powered OCR",
            desc: "Extract declaration text from packaging.",
          },
          {
            icon: Cpu,
            title: "Rule-Based Validation",
            desc: "Compare against compliance rules.",
          },
          {
            icon: FileImage,
            title: "Visual Analysis",
            desc: "Check font size, placement, readability.",
          },
          {
            icon: FileBarChart,
            title: "Digital Reports",
            desc: "Generate structured compliance reports.",
          },
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg text-primary">
              <item.icon className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{item.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ProblemSection = () => (
  <section className="container mx-auto px-4 md:px-8 py-20">
    <div className="text-center max-w-2xl mx-auto mb-12">
      <h2 className="text-3xl font-bold tracking-tight mb-4">
        Manual Compliance Inspection Doesn't Scale
      </h2>
      <p className="text-muted-foreground">
        Packaged commodities exist in massive volumes. Manual inspection is
        time-consuming, prone to human error, and difficult to standardize
        across jurisdictions.
      </p>
    </div>

    <div className="relative grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
      <Card className="group overflow-hidden border-border bg-muted/20 transition-all duration-300 hover:shadow-md">
        <CardHeader className="border-b bg-muted/30 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Traditional Method
              </p>

              <CardTitle className="mt-1 text-xl">
                Traditional Inspection
              </CardTitle>
            </div>

            <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              Manual
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border bg-background">
            <img
              src={Image.TraditionalCheck}
              alt="Traditional inspection process"
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Relies on manual checking and visual inspection of package labels.
          </p>
        </CardContent>
      </Card>

      <div className="absolute left-1/2 top-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 md:flex">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-background bg-primary text-xs font-bold text-primary-foreground shadow-md">
          VS
        </div>
      </div>

      <Card className="group relative overflow-hidden border-primary/40 bg-primary/[0.03] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        {/* Decorative CPU */}
        <div className="pointer-events-none absolute -right-6 -top-6 opacity-[0.06]">
          <Cpu className="h-32 w-32 text-primary" />
        </div>

        <CardHeader className="relative border-b border-primary/10 bg-primary/[0.04] px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                AI-Assisted Method
              </p>

              <CardTitle className="mt-1 text-xl text-primary">
                With PackVerify
              </CardTitle>
            </div>

            <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Automated
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 p-4 sm:p-6">
          <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-primary/20 bg-background">
            <img
              src={Image.DigitalCheck}
              alt="PackVerify automated inspection"
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>

          <p className="mt-4 text-center text-sm font-medium text-foreground">
            AI-assisted analysis extracts declarations and identifies potential
            compliance issues in seconds.
          </p>
        </CardContent>
      </Card>
    </div>
  </section>
);

const HowItWorks = () => (
  <section
    id="how-it-works"
    className="bg-muted/30 py-20 border-y border-border"
  >
    <div className="container mx-auto px-4 md:px-8">
      <h2 className="text-3xl font-bold tracking-tight text-center mb-16">
        From Package Image to Compliance Report
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 max-w-6xl mx-auto">
        {[
          {
            num: "01",
            title: "Capture",
            icon: ScanLine,
            desc: "Upload or capture the packaged commodity image.",
          },
          {
            num: "02",
            title: "Extract",
            icon: FileText,
            desc: "OCR detects relevant product declarations.",
          },
          {
            num: "03",
            title: "Validate",
            icon: ShieldCheck,
            desc: "The rule engine evaluates extracted data.",
          },
          {
            num: "04",
            title: "Detect",
            icon: ShieldAlert,
            desc: "Potential missing information is highlighted.",
          },
          {
            num: "05",
            title: "Report",
            icon: FileBarChart,
            desc: "Generate a structured inspection report.",
          },
        ].map((step, i) => (
          <div
            key={i}
            className="relative flex flex-col items-center text-center group"
          >
            {i !== 4 && (
              <div className="hidden md:block absolute top-8 left-[60%] w-full h-[2px] bg-border group-hover:bg-primary/50 transition-colors" />
            )}
            <div className="w-16 h-16 rounded-full bg-background border-2 border-border flex items-center justify-center mb-4 z-10 group-hover:border-primary group-hover:text-primary transition-all shadow-sm">
              <step.icon className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-muted-foreground mb-1">
              {step.num} — {step.title}
            </span>
            <p className="text-sm text-muted-foreground">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ScanDemo = () => (
  <section className="container mx-auto px-4 md:px-8 py-20">
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold tracking-tight">
        See Compliance Analysis in Action
      </h2>
      <p className="text-muted-foreground mt-2">
        Interactive visual demonstration of the extraction and validation
        process.
      </p>
    </div>

    <div className="flex flex-col lg:flex-row gap-6 max-w-5xl mx-auto">
      {/* Left Pane - Image */}
      <Card className="flex-1 bg-muted/20 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground tracking-wider uppercase">
            Product Image
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="aspect-square bg-background border border-border rounded-lg overflow-hidden">
            <img
              src={Image.Product_image}
              alt="Product"
              className="w-full h-full object-cover"
            />
          </div>
        </CardContent>
      </Card>

      {/* Right Pane - Extraction */}
      <div className="flex-1 flex flex-col gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground tracking-wider uppercase">
              Extracted Declarations
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Product Name</p>
              <p className="font-medium">ABC Biscuits</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Net Quantity</p>
              <p className="font-medium">500 g</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">MRP</p>
              <p className="font-medium">₹120</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Consumer Care</p>
              <p className="font-medium text-destructive">Not Found</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-900/50">
          <CardHeader className="pb-3 bg-amber-50 dark:bg-amber-950/20">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-bold tracking-wider uppercase">
                Compliance Analysis
              </CardTitle>
              <Badge
                variant="outline"
                className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400"
              >
                NEEDS REVIEW
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Compliance Score</span>
                <span className="font-bold">72%</span>
              </div>
              <Progress value={72} className="h-2" />
            </div>
            <div className="space-y-2 pt-2">
              <div className="flex items-center text-sm gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Net
                Quantity format valid
              </div>
              <div className="flex items-center text-sm gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> MRP
                formatting correct
              </div>
              <div className="flex items-center text-sm gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Marginal
                Readability
              </div>
              <div className="flex items-center text-sm gap-2">
                <XCircle className="h-4 w-4 text-destructive" /> Missing
                Consumer Care
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
);

const WhatWeCheck = () => (
  <section id="compliance" className="bg-muted/20 py-20 border-t border-border">
    <div className="container mx-auto px-4 md:px-8">
      <div className="mb-12">
        <h2 className="text-3xl font-bold tracking-tight">
          Comprehensive Compliance Screening
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Detecting potential issues across mandatory declarations per the Legal
          Metrology (Packaged Commodities) Rules, 2011.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          "Manufacturer / Packer Details",
          "Importer Details",
          "Net Quantity",
          "MRP (Maximum Retail Price)",
          "Date Information",
          "Consumer Care Details",
          "Readability",
          "Apparent Font Size",
          "Declaration Completeness",
        ].map((check, i) => (
          <Card
            key={i}
            className="hover:shadow-md transition-shadow hover:border-primary/50 group"
          >
            <CardContent className="p-4 flex items-start gap-3">
              <div className="p-2 bg-muted rounded-md group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">{check}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Screen for presence, format, and potential issues.
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

const RuleEngineArchitecture = () => (
  <section className="container mx-auto px-4 md:px-8 py-20">
    <div className="flex flex-col items-center max-w-3xl mx-auto font-mono text-sm">
      <img src={Image.System_Image} alt="System" />
    </div>
  </section>
);

const DashboardPreview = () => (
  <section id="features" className="bg-muted/30 py-20 border-t border-border">
    <div className="container mx-auto px-4 md:px-8">
      <div className="mb-12 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            A Clear View of Compliance Activity
          </h2>
          <p className="text-muted-foreground mt-2">
            Monitor inspections, view trends, and manage reviews.
          </p>
        </div>
      </div>

      <div className="bg-background border border-border rounded-xl shadow-sm p-6 max-w-5xl mx-auto">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Products Scanned", value: "1,248" },
            { label: "Compliant", value: "892", color: "text-emerald-600" },
            { label: "Needs Review", value: "356", color: "text-amber-600" },
            {
              label: "Potential Issues",
              value: "184",
              color: "text-destructive",
            },
          ].map((kpi, i) => (
            <div
              key={i}
              className="p-4 border border-border rounded-lg bg-card"
            >
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                {kpi.label}
              </p>
              <p
                className={`text-2xl font-bold ${kpi.color || "text-foreground"}`}
              >
                {kpi.value}
              </p>
            </div>
          ))}
        </div>

        {/* CSS Chart */}
        <Card className="shadow-none border-border">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Violation Categories (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Missing Declaration", width: "85%", count: 142 },
              { label: "MRP Presentation", width: "60%", count: 89 },
              { label: "Readability", width: "45%", count: 56 },
              { label: "Font Size", width: "35%", count: 41 },
              { label: "Consumer Care", width: "20%", count: 28 },
            ].map((bar, i) => (
              <div key={i} className="flex items-center text-sm">
                <div className="w-40 text-muted-foreground truncate pr-4">
                  {bar.label}
                </div>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/70 rounded-full"
                    style={{ width: bar.width }}
                  />
                </div>
                <div className="w-12 text-right text-muted-foreground font-mono text-xs">
                  {bar.count}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
);

const ReportPreview = () => (
  <section id="reports" className="container mx-auto px-4 md:px-8 py-20">
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          Every Inspection. Documented.
        </h2>
        <p className="text-muted-foreground mb-6">
          Generate standardized, tamper-evident digital reports for every scan.
          Maintain a comprehensive audit trail with original images, extracted
          data, and rule evaluations.
        </p>
        <div className="flex gap-4">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" /> Export PDF
          </Button>
          <Button variant="outline">Export Editable</Button>
        </div>
      </div>

      <Card className="shadow-xl border-border bg-card mx-auto w-full max-w-md transform rotate-1 hover:rotate-0 transition-transform">
        <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">
                PRODUCT COMPLIANCE REPORT
              </CardTitle>
              <CardDescription className="font-mono mt-1">
                ID: PC-2026-001248
              </CardDescription>
            </div>
            <Badge
              variant="outline"
              className="bg-amber-100 text-amber-800 border-amber-200"
            >
              NEEDS REVIEW
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Product:</span>
              <br />
              ABC Biscuits
            </div>
            <div>
              <span className="text-muted-foreground">Scan Date:</span>
              <br />
              28 Aug 2026
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Checks Performed
            </span>
            <div className="mt-3 space-y-2 border border-border rounded-md p-3 bg-muted/10">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Net
                  Quantity
                </span>{" "}
                <span>Pass</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> MRP
                </span>{" "}
                <span>Pass</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />{" "}
                  Readability
                </span>{" "}
                <span className="text-amber-600">Review</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-destructive" /> Missing Info
                </span>{" "}
                <span className="text-destructive">Fail</span>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <FileImage className="w-4 h-4" /> Evidence: 3 photographs attached
          </div>
        </CardContent>
      </Card>
    </div>
  </section>
);

const EnforcementTeams = () => (
  <section className="bg-muted/20 py-20 border-y border-border">
    <div className="container mx-auto px-4 md:px-8">
      <h2 className="text-3xl font-bold tracking-tight text-center mb-12">
        Designed for Modern Compliance Enforcement
      </h2>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {[
          {
            icon: ShieldCheck,
            title: "Enforcement Officers",
            desc: "Quickly screen products in the field and identify potential compliance issues instantly.",
          },
          {
            icon: UserCheck,
            title: "Administrators",
            desc: "Monitor inspections, product records, and manage review queues for reported issues.",
          },
          {
            icon: Layers,
            title: "Supervisors",
            desc: "Track enforcement activity and broad compliance trends through centralized dashboards.",
          },
        ].map((team, i) => (
          <Card key={i} className="bg-card">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                <team.icon className="w-6 h-6" />
              </div>
              <CardTitle className="text-xl">{team.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{team.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

const SecuritySection = () => (
  <section className="container mx-auto px-4 md:px-8 py-16">
    <div className="flex flex-col md:flex-row gap-8 items-center bg-card border border-border rounded-2xl p-8 shadow-sm max-w-4xl mx-auto">
      <div className="flex-1">
        <div className="flex items-center gap-2 text-primary mb-4">
          <Lock className="w-6 h-6" />
          <h3 className="text-2xl font-bold text-foreground">
            Secure by Design
          </h3>
        </div>
        <p className="text-muted-foreground mb-6">
          Enterprise-grade security ensuring inspection data, evidence, and
          compliance reports remain protected and immutable.
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" /> Role-based access
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" /> Audit logs
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" /> Secure document
            handling
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" /> Inspection history
          </div>
        </div>
      </div>
    </div>
  </section>
);

const FinalCTA = () => (
  <section className="bg-primary text-primary-foreground py-24">
    <div className="container mx-auto px-4 md:px-8 text-center max-w-3xl">
      <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
        Make Product Compliance Faster, Smarter and More Transparent.
      </h2>
      <p className="text-primary-foreground/80 text-lg mb-10">
        Use AI-assisted screening to streamline packaged commodity inspections
        and organize compliance evidence in one powerful platform.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button
          size="lg"
          variant="secondary"
          className="h-14 px-8 text-lg text-primary"
        >
          Start a Scan
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-14 px-8 text-lg bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10 text-primary-foreground"
        >
          View Demo
        </Button>
      </div>
    </div>
  </section>
);

export default function Home() {
  return (
    <>
      <Navbar/>
      <Hero />
      <CapabilityStrip />
      <ProblemSection />
      <HowItWorks />
      <ScanDemo />
      <WhatWeCheck />
      <RuleEngineArchitecture />
      <DashboardPreview />
      <ReportPreview />
      <EnforcementTeams />
      <SecuritySection />
      <FinalCTA />
      <Footer/>
    </>
  );
}