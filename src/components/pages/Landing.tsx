import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import Logo from '../ui/Logo';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const Landing: React.FC = () => {

  useGSAP(() => {
    // Rotating hero title (4–6 words, describing what Lakra does)
    const titlePhrases: string[] = [
      'Automate MT quality',
      'Streamline human evaluation',
      'Standardize annotations consistently',
      'Collect research-grade data',
      'Manage annotation workflows',
      'Accelerate language evaluation',
      'Improve translation assessment',
      'Scale evaluation operations'
    ];

    const titleEl = document.querySelector('.hero-title') as HTMLElement | null;
    const titleWrap = document.querySelector('.hero-title-wrap') as HTMLElement | null;
    const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const setTitleWithWords = (text: string) => {
      if (!titleEl) return;
      const words = text.split(' ');
      titleEl.innerHTML = words
        .map(w => `<span class="word inline-block align-baseline">${w}</span>`) // inline-block enables y transforms per word
        .join(' ');
    };

    if (titleEl) {
      setTitleWithWords(titlePhrases[0]);
    }

    // Prevent layout shift: measure tallest phrase and set wrapper min-height
    const measureAndLockHeight = () => {
      if (!titleEl || !titleWrap) return;
      const h1 = titleEl.closest('h1') as HTMLElement | null;
      const reference = h1 ?? titleWrap;
      const width = reference.getBoundingClientRect().width;
      const temp = document.createElement('div');
      temp.style.position = 'fixed';
      temp.style.left = '-9999px';
      temp.style.top = '0';
      temp.style.width = `${width}px`;
      // copy computed font styles
      const cs = window.getComputedStyle(reference);
      temp.style.font = cs.font;
      temp.style.letterSpacing = cs.letterSpacing as string;
      temp.style.lineHeight = cs.lineHeight as string;
      temp.style.fontWeight = cs.fontWeight as string;
      temp.style.whiteSpace = 'normal';
      document.body.appendChild(temp);
      let maxH = 0;
      for (const p of titlePhrases) {
        temp.textContent = p;
        const h = Math.ceil(temp.getBoundingClientRect().height);
        if (h > maxH) maxH = h;
      }
      document.body.removeChild(temp);
      titleWrap.style.minHeight = `${maxH}px`;
    };
    measureAndLockHeight();

    let titleIdx = 0;
    let titleOut: gsap.core.Tween | null = null;
    let titleIn: gsap.core.Tween | null = null;
    let titleCycleDelay: gsap.core.Tween | null = null;
    let titleInterval: number | undefined;

    if (!prefersReduced) {
      const wordsSelector = '.hero-title .word';
      const cycleTitle = () => {
        // idle delay before out
        titleCycleDelay = gsap.to({}, { duration: 1.4, onComplete: () => {
          // animate current words out
          titleOut = gsap.to(wordsSelector, {
            y: -12,
            autoAlpha: 0,
            duration: 0.28,
            ease: 'power2.in',
            stagger: 0.03,
            onComplete: () => {
              // swap content and animate new words in (fresh targets)
              titleIdx = (titleIdx + 1) % titlePhrases.length;
              setTitleWithWords(titlePhrases[titleIdx]);
              titleIn = gsap.fromTo(wordsSelector, { y: 12, autoAlpha: 0 }, {
                y: 0,
                autoAlpha: 1,
                duration: 0.4,
                ease: 'power2.out',
                stagger: 0.04,
                onComplete: () => {
                  // schedule next cycle
                  titleCycleDelay = gsap.to({}, { duration: 1.0, onComplete: cycleTitle });
                }
              });
            }
          });
        }});
      };
      cycleTitle();
    } else {
      // Reduced motion: no animation, just swap the text periodically
      if (titleEl) titleEl.textContent = titlePhrases[0];
      titleInterval = window.setInterval(() => {
        titleIdx = (titleIdx + 1) % titlePhrases.length;
        if (titleEl) titleEl.textContent = titlePhrases[titleIdx];
      }, 3500);
    }

    // Sentences to cycle through
    const sentences = [
      {
        source: 'Kumusta ka na? Kamusta ang trabaho mo?',
        prefix: '"How are you? ',
        highlight: 'How is your work',
        suffix: '"?'
      },
      {
        source: 'Anong oras na? May klase ka ba ngayon?',
        prefix: '"What time is it? ',
        highlight: 'Do you have class today',
        suffix: '"?'
      },
      {
        source: 'Magkano ang kilo ng mangga sa palengke?',
        prefix: '"How much is a kilo of mangoes ',
        highlight: 'at the market',
        suffix: '"?'
      }
    ];

    const setTexts = (scope: string, idx: number) => {
      const item = sentences[idx % sentences.length];
      const sourceEl = document.querySelector(`${scope} .source-text`);
      const prefixEl = document.querySelector(`${scope} .trans-prefix`);
      const highlightEl = document.querySelector(`${scope} .demo-select`);
      const suffixEl = document.querySelector(`${scope} .trans-suffix`);
      if (sourceEl) sourceEl.textContent = item.source;
      if (prefixEl) prefixEl.textContent = item.prefix;
      if (highlightEl) highlightEl.textContent = item.highlight;
      if (suffixEl) suffixEl.textContent = item.suffix;
    };

    const pickRating = (prev?: number) => {
      let attempts = 0;
      let val = Math.floor(Math.random() * 5) + 1; // 1..5
      while (prev && val === prev && attempts < 4) {
        val = Math.floor(Math.random() * 5) + 1;
        attempts++;
      }
      if (prev && val === prev) val = ((val % 5) + 1); // ensure different
      return val;
    };

    const animateRatings = (scope: string, f: number, a: number, o: number, dur = 0.35, scale = 1.08) => {
      const ease = 'power2.out';
      gsap.fromTo(`${scope} .demo-rating > div:nth-child(1) .btn[data-val="${f}"]`,
        { backgroundColor: '#ffffff', borderColor: '#d1d5db', color: '#374151', scale: 1 },
        { backgroundColor: '#2563eb', borderColor: '#2563eb', color: '#ffffff', scale, duration: dur, ease }
      );
      gsap.fromTo(`${scope} .demo-rating > div:nth-child(2) .btn[data-val="${a}"]`,
        { backgroundColor: '#ffffff', borderColor: '#d1d5db', color: '#374151', scale: 1 },
        { backgroundColor: '#2563eb', borderColor: '#2563eb', color: '#ffffff', scale, duration: dur, ease, delay: 0.1 }
      );
      gsap.fromTo(`${scope} .demo-rating > div:nth-child(3) .btn[data-val="${o}"]`,
        { backgroundColor: '#ffffff', borderColor: '#d1d5db', color: '#374151', scale: 1 },
        { backgroundColor: '#2563eb', borderColor: '#2563eb', color: '#ffffff', scale, duration: dur, ease, delay: 0.2 }
      );
    };

    let loopIndex = 0;
    let heroFluency = pickRating();
    let heroAdequacy = pickRating();
    let heroOverall = pickRating();

    let prevHeroFluency = heroFluency;
    let prevHeroAdequacy = heroAdequacy;
    let prevHeroOverall = heroOverall;

    // Initialize hero text and hide parts for first fade-in
    setTexts('.hero-anim', loopIndex);
    gsap.set(['.hero-anim .source-text', '.hero-anim .trans-prefix', '.hero-anim .demo-select', '.hero-anim .trans-suffix'], { autoAlpha: 0, y: 4 });

    // HERO TIMELINE (slower pacing)
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.0 });

    // Reset state before each loop (scoped to hero only)
    tl.set([
      '.hero-anim .demo-select',
      '.hero-anim .demo-permanent',
      '.hero-anim .demo-modal',
      '.hero-anim .demo-rating .btn',
      '.hero-anim .demo-submit'
    ], { clearProps: 'all' });

    // Fade in sentence parts (morph effect)
    tl.to(['.hero-anim .source-text', '.hero-anim .trans-prefix', '.hero-anim .demo-select', '.hero-anim .trans-suffix'], {
      autoAlpha: 1,
      y: 0,
      duration: 0.45,
      stagger: 0.08,
      ease: 'power2.out'
    });

    // Step 1: Select a phrase (simulate text selection)
    tl.fromTo('.hero-anim .demo-select', { backgroundColor: 'transparent' }, {
      backgroundColor: 'rgba(250,204,21,0.35)',
      duration: 0.8,
      ease: 'power2.out'
    });

    // Step 2: Show mini modal (Add Annotation)
    tl.fromTo('.hero-anim .demo-modal', { autoAlpha: 0, y: 10, scale: 0.98 }, {
      autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: 'power2.out'
    }).to({}, { duration: 0.8 });

    // Step 3: Apply permanent highlight styling, hide modal
    tl.to('.hero-anim .demo-select', {
      backgroundColor: 'rgba(253,230,138,0.6)',
      borderBottomColor: '#f59e0b',
      color: '#92400e',
      boxShadow: 'inset 0 -2px 0 #f59e0b',
      duration: 0.55
    }).to('.hero-anim .demo-modal', { autoAlpha: 0, y: -6, duration: 0.35 }, '<');

    // Step 4: Emphasize random rating buttons for all three categories (runtime selection)
    tl.add(() => {
      animateRatings('.hero-anim', heroFluency, heroAdequacy, heroOverall, 0.35, 1.08);
    });
    tl.to({}, { duration: 0.6 });

    // Step 5: Show submit confirmation chip
    tl.fromTo('.hero-anim .demo-submit', { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.45 });

    // Pause then fade out sentence parts for morph and reset highlight styles
    tl.to({}, { duration: 0.9 });
    tl.to(['.hero-anim .source-text', '.hero-anim .trans-prefix', '.hero-anim .demo-select', '.hero-anim .trans-suffix'], {
      autoAlpha: 0,
      y: -4,
      duration: 0.35,
      stagger: 0.06,
      ease: 'power2.in'
    });
    tl.to(['.hero-anim .demo-select'], { backgroundColor: 'transparent', boxShadow: 'none', clearProps: 'borderBottomColor,color', duration: 0.15 });

    // Swap to next sentence and new random ratings while hidden
    tl.add(() => {
      loopIndex = (loopIndex + 1) % sentences.length;
      prevHeroFluency = heroFluency;
      prevHeroAdequacy = heroAdequacy;
      prevHeroOverall = heroOverall;
      heroFluency = pickRating(prevHeroFluency);
      heroAdequacy = pickRating(prevHeroAdequacy);
      heroOverall = pickRating(prevHeroOverall);
      setTexts('.hero-anim', loopIndex);
      gsap.set(['.hero-anim .source-text', '.hero-anim .trans-prefix', '.hero-anim .demo-select', '.hero-anim .trans-suffix'], { y: 4 });
    });

    // FEATURES TIMELINE (smaller, slower)
    let featuresIndex = 0;
    let featuresFluency = pickRating();
    let featuresAdequacy = pickRating();
    let featuresOverall = pickRating();

    let prevFeaturesFluency = featuresFluency;
    let prevFeaturesAdequacy = featuresAdequacy;
    let prevFeaturesOverall = featuresOverall;

    // Initialize features text and hide parts
    setTexts('.features-anim', featuresIndex);
    gsap.set(['.features-anim .source-text', '.features-anim .trans-prefix', '.features-anim .demo-select', '.features-anim .trans-suffix'], { autoAlpha: 0, y: 3 });

    const tlFeatures = gsap.timeline({ repeat: -1, repeatDelay: 1.2 });

    tlFeatures.set([
      '.features-anim .demo-select',
      '.features-anim .demo-modal',
      '.features-anim .demo-rating .btn',
      '.features-anim .demo-submit'
    ], { clearProps: 'all' });

    // Fade in small sentence parts
    tlFeatures.to(['.features-anim .source-text', '.features-anim .trans-prefix', '.features-anim .demo-select', '.features-anim .trans-suffix'], {
      autoAlpha: 1,
      y: 0,
      duration: 0.38,
      stagger: 0.06,
      ease: 'power2.out'
    });

    tlFeatures.fromTo('.features-anim .demo-select', { backgroundColor: 'transparent' }, {
      backgroundColor: 'rgba(250,204,21,0.30)',
      duration: 0.7,
      ease: 'power2.out'
    });

    tlFeatures.fromTo('.features-anim .demo-modal', { autoAlpha: 0, y: 8, scale: 0.98 }, {
      autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: 'power2.out'
    }).to({}, { duration: 0.7 });

    tlFeatures.to('.features-anim .demo-select', {
      backgroundColor: 'rgba(253,230,138,0.55)',
      borderBottomColor: '#f59e0b',
      color: '#92400e',
      boxShadow: 'inset 0 -2px 0 #f59e0b',
      duration: 0.5
    }).to('.features-anim .demo-modal', { autoAlpha: 0, y: -5, duration: 0.3 }, '<');

    // Emphasize random rating buttons for all three categories (runtime selection)
    tlFeatures.add(() => {
      animateRatings('.features-anim', featuresFluency, featuresAdequacy, featuresOverall, 0.32, 1.06);
    });
    tlFeatures.to({}, { duration: 0.55 });

    tlFeatures.fromTo('.features-anim .demo-submit', { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.4 });

    // Fade out small sentence parts, then reset
    tlFeatures.to({}, { duration: 0.85 });
    tlFeatures.to(['.features-anim .source-text', '.features-anim .trans-prefix', '.features-anim .demo-select', '.features-anim .trans-suffix'], {
      autoAlpha: 0,
      y: -3,
      duration: 0.32,
      stagger: 0.05,
      ease: 'power2.in'
    });
    tlFeatures.to(['.features-anim .demo-select'], { backgroundColor: 'transparent', boxShadow: 'none', clearProps: 'borderBottomColor,color', duration: 0.14 });

    // Swap to next small sentence and new random ratings while hidden
    tlFeatures.add(() => {
      featuresIndex = (featuresIndex + 1) % sentences.length;
      prevFeaturesFluency = featuresFluency;
      prevFeaturesAdequacy = featuresAdequacy;
      prevFeaturesOverall = featuresOverall;
      featuresFluency = pickRating(prevFeaturesFluency);
      featuresAdequacy = pickRating(prevFeaturesAdequacy);
      featuresOverall = pickRating(prevFeaturesOverall);
      setTexts('.features-anim', featuresIndex);
      gsap.set(['.features-anim .source-text', '.features-anim .trans-prefix', '.features-anim .demo-select', '.features-anim .trans-suffix'], { y: 3 });
    });

    return () => {
      if (titleOut) titleOut.kill();
      if (titleIn) titleIn.kill();
      if (titleCycleDelay) titleCycleDelay.kill();
      if (titleInterval) window.clearInterval(titleInterval);
      tl.kill();
      tlFeatures.kill();
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-white">
      <Navbar activePage="landing" />

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0">
          <div className="h-[460px] md:h-[580px] bg-[radial-gradient(110%_90%_at_20%_10%,rgba(236,72,153,0.35),rgba(255,255,255,0)_45%),radial-gradient(80%_60%_at_80%_0%,rgba(236,72,153,0.25),rgba(255,255,255,0)_40%),linear-gradient(to_bottom,rgba(244,244,245,1),rgba(255,255,255,1))]"></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-6 pt-28 pb-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900">
                <span className="hero-title-wrap block">
                  <span className="hero-title">Automate & manage translation quality with ease</span>
                </span>
              </h1>
              <p className="mt-6 text-lg text-gray-600 max-w-xl">
                Lakra streamlines human annotation and assisted evaluation for Philippine languages—fast, consistent, and research-ready.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="bg-beauty-bush-600 hover:bg-beauty-bush-700 text-white px-7 py-3 rounded-lg font-semibold inline-flex items-center justify-center">
                  Free Sign Up
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
                <Link to="/features" className="border-2 border-beauty-bush-600 text-beauty-bush-700 hover:bg-beauty-bush-600 hover:text-white px-7 py-3 rounded-lg font-semibold inline-flex items-center justify-center">
                  Explore Features
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg hero-anim">
                <Logo size="large" className="h-14 w-auto" />
                <div className="mt-5 bg-white rounded-2xl border border-gray-200 p-6 relative overflow-hidden">
                  <p className="text-gray-800 text-base mb-3">
                    <span className="font-semibold">Original: </span>
                    <span className="source-text">Kumusta ka na? Kamusta ang trabaho mo?</span>
                  </p>
                  <p className="text-gray-700 text-base leading-relaxed">
                    <span className="font-semibold">Translation: </span>
                    <span className="trans-prefix">"How are you? </span>
                    <span className="demo-select rounded px-1">How is your work</span>
                    <span className="trans-suffix">"?</span>
                  </p>

                  {/* Faux Add Annotation Modal (hidden by default, shown via GSAP) */}
                  <div className="demo-modal opacity-0 pointer-events-none absolute top-12 right-4 bg-white border border-gray-200 rounded-lg shadow-md p-4 w-64">
                    <p className="text-xs font-medium text-gray-800">Add Annotation</p>
                    <p className="text-[11px] text-gray-600 mt-1">Minor Semantic — “word choice could be improved”</p>
                    <div className="mt-2 flex justify-end">
                      <span className="inline-flex items-center text-[11px] px-2.5 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">Add</span>
                    </div>
                  </div>

                  {/* Ratings Row */}
                  <div className="demo-rating mt-4 grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-[12px] text-gray-500">Fluency</p>
                      <div className="mt-1 flex space-x-1.5">
                        {[1,2,3,4,5].map(v => (
                          <span key={v} data-val={v} className="btn inline-flex items-center justify-center w-7 h-7 rounded border text-[12px] bg-white border-gray-300 text-gray-700">{v}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[12px] text-gray-500">Adequacy</p>
                      <div className="mt-1 flex space-x-1.5">
                        {[1,2,3,4,5].map(v => (
                          <span key={v} data-val={v} className="btn inline-flex items-center justify-center w-7 h-7 rounded border text-[12px] bg-white border-gray-300 text-gray-700">{v}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[12px] text-gray-500">Overall</p>
                      <div className="mt-1 flex space-x-1.5">
                        {[1,2,3,4,5].map(v => (
                          <span key={v} data-val={v} className="btn inline-flex items-center justify-center w-7 h-7 rounded border text-[12px] bg-white border-gray-300 text-gray-700">{v}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Submit Chip */}
                  <div className="demo-submit opacity-0 absolute bottom-4 right-4 bg-green-100 text-green-700 text-[12px] px-2.5 py-1 rounded border border-green-200 inline-flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                    Submitted
                  </div>
                </div>
              </div>
            </div>

import AnimatedBackground from '../layout/AnimatedBackground';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import Logo from '../ui/Logo';

const Landing: React.FC = () => {

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-gray-50 to-beauty-bush-50 overflow-hidden">
      <AnimatedBackground />
      
      <Navbar activePage="landing" />

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <Logo size="large" className="h-24 md:h-32 w-auto mx-auto" />
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto">
            Advanced machine translation evaluation platform for Philippine languages, 
            featuring human annotation interfaces and AI-powered quality assessment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-beauty-bush-600 hover:bg-beauty-bush-700 text-white px-8 py-4 rounded-lg text-xl font-semibold transition-colors inline-flex items-center justify-center"
            >
              Get Started
              <svg className="ml-2 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link 
              to="/features" 
              className="border-2 border-beauty-bush-600 text-beauty-bush-600 hover:bg-beauty-bush-600 hover:text-white px-8 py-4 rounded-lg text-xl font-semibold transition-colors inline-flex items-center justify-center"
            >
              Learn More
              <svg className="ml-2 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="relative z-10 py-20 px-6 bg-gradient-to-b from-white to-gray-50">
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-16">
            Platform Features
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Annotation Interface */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
              <div className="mb-6">
                <div className="bg-beauty-bush-50 rounded-lg p-4 sm:p-4 mb-4 features-anim">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-beauty-bush-200/50 shadow-lg">
              <div className="mb-6">
                <div className="bg-beauty-bush-50 rounded-lg p-4 mb-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm">Human Annotation Interface</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-600 text-xs">Active</span>
                      </div>
                    </div>
                    
                    {/* Animated Small Demo */}
                    <div className="bg-white rounded p-3 sm:p-3 border border-gray-200 relative overflow-hidden w-full max-w-full md:max-w-none">
                      <p className="text-gray-800 text-sm sm:text-xs mb-2 sm:mb-1.5 break-words whitespace-normal">
                        <span className="font-semibold">Original: </span>
                        <span className="source-text">Kumusta ka na? Kamusta ang trabaho mo?</span>
                      </p>
                      <p className="text-gray-700 text-sm sm:text-xs leading-relaxed break-words whitespace-normal">
                        <span className="font-semibold">Translation: </span>
                        <span className="trans-prefix">"How are you? </span>
                        <span className="demo-select rounded px-1 sm:px-0.5">How is your work</span>
                        <span className="trans-suffix">"?</span>
                      </p>

                      {/* Mini Modal - responsive size/position */}
                      <div className="demo-modal opacity-0 pointer-events-none absolute top-10 sm:top-8 right-3 sm:right-3 bg-white border border-gray-200 rounded-md shadow-lg p-3 sm:p-2.5 w-[14rem] sm:w-56 max-w-[calc(100%-1rem)]">
                        <p className="text-[12px] sm:text-[11px] font-medium text-gray-800">Add Annotation</p>
                        <p className="text-[11px] sm:text-[10px] text-gray-600 mt-0.5">Minor Semantic — word choice improvement</p>
                        <div className="mt-1.5 flex justify-end">
                          <span className="inline-flex items-center text-[11px] sm:text-[10px] px-2.5 sm:px-2 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">Add</span>
                        </div>
                      </div>

                      {/* Small Ratings - responsive */}
                      <div className="demo-rating mt-3 sm:mt-2 flex flex-col sm:grid sm:grid-cols-3 gap-2 sm:gap-2">
                        <div>
                          <p className="text-[12px] sm:text-[10px] text-gray-500">Fluency</p>
                          <div className="mt-1 flex space-x-1.5 sm:space-x-1">
                            {[1,2,3,4,5].map(v => (
                              <span key={v} data-val={v} className="btn inline-flex items-center justify-center w-7 h-7 sm:w-6 sm:h-6 rounded border text-[12px] sm:text-[10px] bg-white border-gray-300 text-gray-700">{v}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[12px] sm:text-[10px] text-gray-500">Adequacy</p>
                          <div className="mt-1 flex space-x-1.5 sm:space-x-1">
                            {[1,2,3,4,5].map(v => (
                              <span key={v} data-val={v} className="btn inline-flex items-center justify-center w-7 h-7 sm:w-6 sm:h-6 rounded border text-[12px] sm:text-[10px] bg-white border-gray-300 text-gray-700">{v}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[12px] sm:text-[10px] text-gray-500">Overall</p>
                          <div className="mt-1 flex space-x-1.5 sm:space-x-1">
                            {[1,2,3,4,5].map(v => (
                              <span key={v} data-val={v} className="btn inline-flex items-center justify-center w-7 h-7 sm:w-6 sm:h-6 rounded border text-[12px] sm:text-[10px] bg-white border-gray-300 text-gray-700">{v}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Mini Submit Chip */}
                      <div className="demo-submit opacity-0 absolute bottom-2 right-2 bg-green-100 text-green-700 text-[12px] sm:text-[10px] px-3 sm:px-2 py-1 sm:py-0.5 rounded border border-green-200 inline-flex items-center">
                        <svg className="w-3.5 sm:w-3 h-3.5 sm:h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                        Submitted

                    {/* Demo Content */}
                    <div className="bg-white rounded p-3 border border-beauty-bush-200">
                      <p className="text-gray-800 text-sm mb-2">Original: "Kumusta ka na? Kamusta ang trabaho mo?"</p>
                      <p className="text-gray-600 text-sm">Translation: "How are you? How is your work?"</p>
                      <div className="mt-2 flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-beauty-bush-400 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <span className="text-gray-500 text-xs">85% Quality</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Human Annotation Interface</h3>
              <p className="text-gray-600">
                Interactive text highlighting and error classification system for evaluating machine translation quality, supporting multiple Philippine languages with detailed error analysis and quality scoring.
              </p>
            </div>

            {/* MT Quality Assessment */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-beauty-bush-200/50 shadow-lg">
              <div className="mb-6">
                <div className="bg-beauty-bush-50 rounded-lg p-4 mb-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm">Quality Assessment</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-gray-700 text-sm">AI-Powered Quality Assessment</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                        <span className="text-yellow-600 text-xs">Coming Soon</span>
                      </div>
                    </div>
                    
                    {/* Blurred Demo Content */}
                    <div className="bg-gray-50 rounded p-3 relative overflow-hidden border border-gray-200">
                    <div className="bg-gray-100 rounded p-3 relative overflow-hidden">
                      <div className="blur-sm">
                        <p className="text-gray-800 text-sm mb-2">Original: "Kumusta ka na? Kamusta ang trabaho mo?"</p>
                        <p className="text-gray-600 text-sm">Translation: "How are you? How is your work?"</p>
                        <div className="mt-2 flex items-center space-x-2">
                          <div className="w-16 h-2 bg-gray-400 rounded"></div>
                          <span className="text-gray-500 text-xs">Quality Score</span>
                        </div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-beauty-bush-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium">
                          Coming Soon
                        </div>
                      </div>
                    </div>
                    

                  </div>
                </div>
              </div>
                  
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Assisted Quality Assessment</h3>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">AI-Assisted Quality Assessment</h3>
              <p className="text-gray-600">
                DistilBERT-based quality scoring with confidence levels, automatic error detection, and human-in-the-loop validation for comprehensive MT quality analysis and evaluation workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-8">
            Ready to participate in the research?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join the WiMarka research project and help advance machine translation evaluation for Philippine languages.
          </p>
            <Link 
              to="/register" 
              className="bg-beauty-bush-600 hover:bg-beauty-bush-700 text-white px-10 py-4 rounded-lg text-xl font-semibold transition-colors inline-flex items-center"
            >
              Join the Research
              <svg className="ml-2 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing; 