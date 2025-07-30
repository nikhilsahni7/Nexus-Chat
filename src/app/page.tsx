"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { Separator } from "@/components/ui/separator";
import { useIsAuthenticated } from "@/store/authStore";
import { GitHubLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/chat");
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Header */}
      <header className="relative z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Image
                src="/nexus-logo.png"
                alt="Nexus Chat"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="text-xl font-bold text-gray-900">
                Nexus Chat
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                asChild
                variant="ghost"
                className="text-gray-700 hover:text-gray-900 hover:bg-white/50"
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                asChild
                className="bg-gradient-primary text-white hover:shadow-lg transition-all duration-300"
              >
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16 relative">
        {/* Hero Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center mb-6"
          >
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
              <Icons.star className="h-4 w-4 text-pink-500" />
              <span className="text-sm font-medium text-gray-700">
                Trusted by 10,000+ teams
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
          >
            <span className="text-gray-900">Modern Team</span>
            <br />
            <span className="text-gradient">Communication</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed"
          >
            Connect, collaborate, and communicate with your team using our
            beautifully designed, lightning-fast chat platform built for modern
            workplaces.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <Button
              asChild
              size="lg"
              className="bg-gradient-primary text-white hover:shadow-xl transform hover:scale-105 transition-all duration-300 px-8 py-4 text-lg font-semibold"
            >
              <Link href="/register">Get Started →</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-gray-300 text-gray-700 hover:bg-white hover:border-gray-400 px-8 py-4 text-lg font-semibold transition-all duration-300"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </motion.div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {featureCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <FeatureCard {...card} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.section>

        <Separator className="my-16" />

        {/* Advanced Features */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-12 text-gray-900"
          >
            Advanced Features
          </motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            <AnimatePresence>
              {featureItems.map((item, index) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <FeatureItem {...item} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.section>

        <ChatAnimation />

        <DeveloperInfo />

        <footer className="text-center text-gray-500 mt-20">
          <p>&copy; 2024 Nexus Chat. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
      <CardHeader className="flex flex-col items-center text-center pb-6">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mb-4 group-hover:shadow-lg transition-all duration-300"
        >
          <div className="text-white text-2xl">{icon}</div>
        </motion.div>
        <CardTitle className="text-xl font-semibold text-gray-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

interface FeatureItemProps {
  icon: React.ReactNode;
  text: string;
}

function FeatureItem({ icon, text }: FeatureItemProps) {
  return (
    <Card className="bg-white border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden group">
      <CardContent className="p-6 flex flex-col items-center justify-center space-y-3">
        <motion.div
          whileHover={{ rotate: 360, scale: 1.2 }}
          transition={{ duration: 0.5 }}
          className="w-12 h-12 bg-gradient-secondary rounded-xl flex items-center justify-center group-hover:bg-gradient-primary transition-all duration-300"
        >
          <span className="text-gray-700 group-hover:text-white text-xl transition-colors duration-300">
            {icon}
          </span>
        </motion.div>
        <Badge
          variant="secondary"
          className="bg-gradient-secondary text-gray-700 border-0 font-medium"
        >
          {text}
        </Badge>
      </CardContent>
    </Card>
  );
}

function ChatAnimation() {
  const messages = [
    "Hey there!",
    "How's it going?",
    "Nexus Chat is awesome!",
    "I love the new features!",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mb-20"
    >
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
        Experience Real-Time Chat
      </h2>
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: index * 0.5 }}
              className={`mb-4 ${index % 2 === 0 ? "text-right" : "text-left"}`}
            >
              <span
                className={`inline-block p-3 rounded-2xl ${
                  index % 2 === 0
                    ? "bg-gradient-primary text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function DeveloperInfo() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-20"
    >
      <h2 className="text-3xl font-bold mb-6 text-gray-900">
        Meet the Developer
      </h2>
      <div className="flex justify-center space-x-6">
        <motion.a
          href="https://x.com/Nikhilllsahni"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 hover:text-pink-500 transition-colors"
          whileHover={{ scale: 1.2, rotate: 5 }}
        >
          <TwitterLogoIcon className="h-8 w-8" />
        </motion.a>
        <motion.a
          href="https://github.com/nikhilsahni7"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 hover:text-pink-500 transition-colors"
          whileHover={{ scale: 1.2, rotate: -5 }}
        >
          <GitHubLogoIcon className="h-8 w-8" />
        </motion.a>
      </div>
    </motion.section>
  );
}

function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-gradient-secondary p-4">
      <div className="max-w-3xl mx-auto space-y-8 animate-pulse">
        <div className="h-12 bg-white/50 rounded-md w-3/4 mx-auto"></div>
        <div className="h-6 bg-white/50 rounded-md w-1/2 mx-auto"></div>
        <div className="flex justify-center space-x-4">
          <div className="h-10 bg-white/50 rounded-md w-24"></div>
          <div className="h-10 bg-white/50 rounded-md w-24"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-24 bg-white/50 rounded-md"></div>
              <div className="h-4 bg-white/50 rounded-md w-3/4 mx-auto"></div>
              <div className="h-4 bg-white/50 rounded-md w-1/2 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const featureCards = [
  {
    icon: <Icons.zap className="h-8 w-8" />,
    title: "Lightning Fast",
    description: "Real-time messaging with zero lag and instant delivery.",
  },
  {
    icon: <Icons.users className="h-8 w-8" />,
    title: "Team Collaboration",
    description: "Seamless group conversations with advanced admin features.",
  },
  {
    icon: <Icons.shield className="h-8 w-8" />,
    title: "Secure & Private",
    description: "Enterprise-grade security with end-to-end encryption.",
  },
  {
    icon: <Icons.image className="h-8 w-8" />,
    title: "Rich Media Support",
    description: "Share text, images, videos, and files seamlessly.",
  },
  {
    icon: <Icons.search className="h-8 w-8" />,
    title: "Powerful Search",
    description: "Find messages, contacts, and content instantly.",
  },
  {
    icon: <Icons.bell className="h-8 w-8" />,
    title: "Smart Notifications",
    description: "Customizable notifications that keep you updated.",
  },
];

const featureItems = [
  { icon: <Icons.edit />, text: "Edit Messages" },
  { icon: <Icons.trash />, text: "Delete Messages" },
  { icon: <Icons.reply />, text: "Reply to Messages" },
  { icon: <Icons.circleDot />, text: "Online Status" },
  { icon: <Icons.image />, text: "Image Sharing" },
  { icon: <Icons.video />, text: "Video Sharing" },
  { icon: <Icons.file />, text: "File Sharing" },
  { icon: <Icons.userPlus />, text: "Create Groups" },
];
