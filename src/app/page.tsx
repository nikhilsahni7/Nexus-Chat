"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useIsAuthenticated } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { GitHubLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons";

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
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto px-4 py-16 relative">
        <header className="text-center mb-16 relative">
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="pt-24"
          >
            <h1 className="text-6xl md:text-8xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-black">
              Nexus Chat
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 font-light">
              Connect, Collaborate, Communicate
            </p>
          </motion.div>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
          >
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-black text-black hover:bg-gray-100"
            >
              <Link href="/login">
                <Icons.user className="mr-2 h-5 w-5" />
                Login
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-black text-white hover:bg-gray-800"
            >
              <Link href="/register">
                <Icons.userPlus className="mr-2 h-5 w-5" />
                Register
              </Link>
            </Button>
          </motion.div>
        </header>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <AnimatePresence>
            {featureCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <FeatureCard {...card} />
              </motion.div>
            ))}
          </AnimatePresence>
        </section>

        <Separator className="my-16" />

        <section className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-black"
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
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <FeatureItem {...item} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        <ChatAnimation />

        <DeveloperInfo />

        <footer className="text-center text-gray-500 mt-16">
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
    <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-col items-center">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {icon}
        </motion.div>
        <CardTitle className="mt-4 text-xl font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 text-center">{description}</p>
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
    <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4 flex flex-col items-center justify-center space-y-2">
        <motion.span
          whileHover={{ rotate: 360, scale: 1.2 }}
          transition={{ duration: 0.5 }}
          className="text-gray-700 text-2xl"
        >
          {icon}
        </motion.span>
        <Badge
          variant="secondary"
          className="mt-2 bg-gradient-to-r from-gray-200 to-gray-300"
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
      className="mb-16"
    >
      <h2 className="text-3xl font-bold text-center mb-8">
        Experience Real-Time Chat
      </h2>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
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
                className={`inline-block p-3 rounded-lg ${
                  index % 2 === 0
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-800"
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
      className="text-center mb-16"
    >
      <h2 className="text-3xl font-bold mb-6">Meet the Developer</h2>
      <div className="flex justify-center space-x-4">
        <motion.a
          href="https://x.com/Nikhilllsahni"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 hover:text-gray-900 transition-colors"
          whileHover={{ scale: 1.2, rotate: 5 }}
        >
          <TwitterLogoIcon className="h-8 w-8" />
        </motion.a>
        <motion.a
          href="https://github.com/nikhilsahni7"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-700 hover:text-gray-900 transition-colors"
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
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-3xl mx-auto space-y-8 animate-pulse">
        <div className="h-12 bg-gray-200 rounded-md w-3/4 mx-auto"></div>
        <div className="h-6 bg-gray-200 rounded-md w-1/2 mx-auto"></div>
        <div className="flex justify-center space-x-4">
          <div className="h-10 bg-gray-200 rounded-md w-24"></div>
          <div className="h-10 bg-gray-200 rounded-md w-24"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-24 bg-gray-200 rounded-md"></div>
              <div className="h-4 bg-gray-200 rounded-md w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded-md w-1/2 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const featureCards = [
  {
    icon: <Icons.messageCircle className="h-12 w-12 text-gray-700" />,
    title: "Real-Time Super Fast Chat",
    description:
      "Experience lightning-fast messaging with our advanced real-time chat system.",
  },
  {
    icon: <Icons.users className="h-12 w-12 text-gray-700" />,
    title: "Group Chats",
    description:
      "Create and manage group chats with admin and participant features.",
  },
  {
    icon: <Icons.image className="h-12 w-12 text-gray-700" />,
    title: "Rich Media Support",
    description:
      "Share text, images, videos, and files seamlessly in your conversations.",
  },
  {
    icon: <Icons.search className="h-12 w-12 text-gray-700" />,
    title: "Powerful Search",
    description:
      "Easily find messages, contacts, and content within your chats.",
  },
  {
    icon: <Icons.bell className="h-12 w-12 text-gray-700" />,
    title: "Smart Notifications",
    description:
      "Stay updated with customizable and intelligent notifications.",
  },
  {
    icon: <Icons.shield className="h-12 w-12 text-gray-700" />,
    title: "Secure Authentication",
    description:
      "Your privacy and security are our top priorities with robust authentication.",
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
