import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { FileText, Brain, TrendingUp, Upload, Zap, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Index = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  const opacity = useTransform(smoothProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(smoothProgress, [0, 0.2], [1, 0.8]);
  const y = useTransform(smoothProgress, [0, 0.3], [0, -100]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate floating shapes
      gsap.to(".float-1", {
        y: -30,
        x: 20,
        rotation: 5,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap.to(".float-2", {
        y: 30,
        x: -20,
        rotation: -5,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap.to(".float-3", {
        y: -20,
        x: -15,
        rotation: 3,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      // Feature cards stagger animation
      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: ".feature-section",
          start: "top 80%",
          toggleActions: "play none none none"
        },
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out"
      });

      // Stats counter animation
      gsap.from(".stat-item", {
        scrollTrigger: {
          trigger: ".stats-section",
          start: "top 80%",
        },
        scale: 0.5,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "back.out(1.7)"
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative overflow-hidden bg-background">
      <Header />

      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="float-1 absolute top-20 right-20 w-64 h-64 rounded-full bg-foreground/5 border-2 border-foreground/20" />
        <div className="float-2 absolute bottom-40 left-10 w-96 h-96 rounded-full bg-foreground/5 border border-foreground/20" />
        <div className="float-3 absolute top-1/2 right-1/3 w-48 h-48 rounded-full bg-foreground/5 border-2 border-foreground/20" />
        <div className="float-1 absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full bg-foreground/10 border border-foreground/30" />
      </div>

      {/* Hero Section with Parallax */}
      <motion.section 
        ref={heroRef}
        style={{ opacity, scale }}
        className="relative min-h-screen flex items-center justify-center px-4 pt-20"
      >
        <div className="max-w-7xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-muted border-2 border-foreground/30 backdrop-blur-sm shadow-lg">
              {/* <Sparkles className="w-4 h-4 text-foreground" /> */}
              <span className="text-sm font-semibold text-foreground">Study Smarter</span>
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl lg:text-9xl font-display font-bold mb-8 leading-none"
          >
            YOUR
            <span className="italic"> ESENCIA</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12"
          >
            Transform your learning with AI-powered analysis, 
            interactive quizzes, and intelligent exam predictions
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link to="/research">
              <Button variant="hero" size="xl" className="group">
                <Upload className="w-5 h-5 mr-2" />
                Get Started
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/notes">
              <Button variant="hero-outline" size="xl" className="group">
                Explore Features
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {/* Scroll Indicator */}
          {/* <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-10 rounded-full border-2 border-foreground/30 flex items-start justify-center p-2"
            >
              <motion.div className="w-1.5 h-1.5 bg-foreground rounded-full" />
            </motion.div>
          </motion.div> */}
        </div>
      </motion.section>

      {/* Stats Section */}
      <section className="stats-section relative py-32 px-4 bg-foreground/5 backdrop-blur-md">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-5xl font-display font-bold text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Why Choose ESENCIA?
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { value: "Gemini API", label: "Uses gemini 2.5 pro" },
              { value: "OCR", label: "Document Analysis" },
              { value: "RAG Based", label: "Authentic Answers" },
              { value: "Python", label: "Flask Backend" },
            ].map((stat, index) => (
              <motion.div 
                key={index} 
                className="stat-item text-center"
                whileHover={{ scale: 1.1, rotate: 2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-5xl md:text-6xl font-display font-bold mb-3 text-foreground">
                  {stat.value}
                </div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Features Showcase */}
      <section className="relative py-32 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-6xl font-display font-bold text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            How It Works
          </motion.h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                step: "01",
                title: "Upload Your Documents",
                description: "Drag and drop research papers, notes, or question papers",
                icon: Upload
              },
              {
                step: "02",
                title: "AI Analysis",
                description: "Our advanced AI processes and understands your content",
                icon: Sparkles
              },
              {
                step: "03",
                title: "Generate Materials",
                description: "Get instant summaries, quizzes, and study guides",
                icon: Zap
              },
              {
                step: "04",
                title: "Study Smarter",
                description: "Use interactive tools to master your subjects",
                icon: Brain
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="relative p-8 rounded-3xl bg-card border-2 border-border hover:border-foreground/50 transition-all group cursor-pointer"
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-foreground flex items-center justify-center text-background font-bold text-xl shadow-lg">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-display font-bold mb-3 group-hover:text-foreground transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <item.icon className="w-10 h-10 text-muted-foreground/30 group-hover:text-foreground/50 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4 bg-foreground text-background overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-background blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-background blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl md:text-7xl font-display font-bold mb-8 drop-shadow-lg">
              Ready to Transform<br />Your Learning?
            </h2>
            <p className="text-xl md:text-2xl mb-12 text-background/90 drop-shadow">
              Join thousands of students already studying smarter
            </p>
            <Link to="/research">
              <Button 
                variant="hero" 
                size="xl" 
                className="group bg-background text-foreground hover:bg-background/90 shadow-2xl hover:shadow-3xl border-0"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Now - It's Free
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-foreground/10">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">
            Built for students, by students. Study smarter, not harder.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
