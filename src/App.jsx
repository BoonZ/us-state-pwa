// App.js – U S State–Capital Flash Cards (no “how many cards” step)
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';

/* ----------  Styling constants ---------- */
const BUTTON_STYLE = {
  backgroundColor: '#1890ff',
  border: 'none',
  color: '#fff',
  padding: '10px 20px',
  borderRadius: 6,
  fontSize: 16,
  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
  cursor: 'pointer',
  margin: 5,
  outline: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  appearance: 'none',
};
const SNAPPIER_TRANSITION_EXIT = { duration: 0.15, ease: 'easeOut' };
const SNAPPIER_TRANSITION_TAP  = { duration: 0.10, ease: 'easeOut' };
const SNAPPIER_BACKGROUND_TRANSITION = 'background-color 0.15s ease';

/* ----------  U S state / capital data ---------- */
const STATES = [
  { state: 'Alabama',          capital: 'Montgomery',      region: 'Southeast'      },
  { state: 'Alaska',           capital: 'Juneau',          region: 'West'           },
  { state: 'Arizona',          capital: 'Phoenix',         region: 'Southwest'      },
  { state: 'Arkansas',         capital: 'Little Rock',     region: 'Southeast'      },
  { state: 'California',       capital: 'Sacramento',      region: 'West'           },
  { state: 'Colorado',         capital: 'Denver',          region: 'Mountain West'  },
  { state: 'Connecticut',      capital: 'Hartford',        region: 'Northeast'      },
  { state: 'Delaware',         capital: 'Dover',           region: 'Mid-Atlantic'   },
  { state: 'Florida',          capital: 'Tallahassee',     region: 'Southeast'      },
  { state: 'Georgia',          capital: 'Atlanta',         region: 'Southeast'      },
  { state: 'Hawaii',           capital: 'Honolulu',        region: 'West'           },
  { state: 'Idaho',            capital: 'Boise',           region: 'Mountain West'  },
  { state: 'Illinois',         capital: 'Springfield',     region: 'Midwest'        },
  { state: 'Indiana',          capital: 'Indianapolis',    region: 'Midwest'        },
  { state: 'Iowa',             capital: 'Des Moines',      region: 'Midwest'        },
  { state: 'Kansas',           capital: 'Topeka',          region: 'Midwest'        },
  { state: 'Kentucky',         capital: 'Frankfort',       region: 'Southeast'      },
  { state: 'Louisiana',        capital: 'Baton Rouge',     region: 'Southeast'      },
  { state: 'Maine',            capital: 'Augusta',         region: 'Northeast'      },
  { state: 'Maryland',         capital: 'Annapolis',       region: 'Mid-Atlantic'   },
  { state: 'Massachusetts',    capital: 'Boston',          region: 'Northeast'      },
  { state: 'Michigan',         capital: 'Lansing',         region: 'Midwest'        },
  { state: 'Minnesota',        capital: 'Saint Paul',      region: 'Midwest'        },
  { state: 'Mississippi',      capital: 'Jackson',         region: 'Southeast'      },
  { state: 'Missouri',         capital: 'Jefferson City',  region: 'Midwest'        },
  { state: 'Montana',          capital: 'Helena',          region: 'Mountain West'  },
  { state: 'Nebraska',         capital: 'Lincoln',         region: 'Midwest'        },
  { state: 'Nevada',           capital: 'Carson City',     region: 'Mountain West'  },
  { state: 'New Hampshire',    capital: 'Concord',         region: 'Northeast'      },
  { state: 'New Jersey',       capital: 'Trenton',         region: 'Mid-Atlantic'   },
  { state: 'New Mexico',       capital: 'Santa Fe',        region: 'Southwest'      },
  { state: 'New York',         capital: 'Albany',          region: 'Northeast'      },
  { state: 'North Carolina',   capital: 'Raleigh',         region: 'Southeast'      },
  { state: 'North Dakota',     capital: 'Bismarck',        region: 'Midwest'        },
  { state: 'Ohio',             capital: 'Columbus',        region: 'Midwest'        },
  { state: 'Oklahoma',         capital: 'Oklahoma City',   region: 'Southwest'      },
  { state: 'Oregon',           capital: 'Salem',           region: 'West'           },
  { state: 'Pennsylvania',     capital: 'Harrisburg',      region: 'Mid-Atlantic'   },
  { state: 'Rhode Island',     capital: 'Providence',      region: 'Northeast'      },
  { state: 'South Carolina',   capital: 'Columbia',        region: 'Southeast'      },
  { state: 'South Dakota',     capital: 'Pierre',          region: 'Midwest'        },
  { state: 'Tennessee',        capital: 'Nashville',       region: 'Southeast'      },
  { state: 'Texas',            capital: 'Austin',          region: 'Southwest'      },
  { state: 'Utah',             capital: 'Salt Lake City',  region: 'Mountain West'  },
  { state: 'Vermont',          capital: 'Montpelier',      region: 'Northeast'      },
  { state: 'Virginia',         capital: 'Richmond',        region: 'Mid-Atlantic'   },
  { state: 'Washington',       capital: 'Olympia',         region: 'West'           },
  { state: 'West Virginia',    capital: 'Charleston',      region: 'Mid-Atlantic'   },
  { state: 'Wisconsin',        capital: 'Madison',         region: 'Midwest'        },
  { state: 'Wyoming',          capital: 'Cheyenne',        region: 'Mountain West'  },
];

const REGIONS = [
  'Entire US',
  'Northeast',
  'Mid-Atlantic',
  'Southeast',
  'Southwest',
  'Midwest',
  'Mountain West',
  'West',
];

/* ----------  Main component ---------- */
export default function App() {
  /* ----- Core state ----- */
  const [step, setStep]                 = useState(0);            // 0-welcome, 1-region, 2-direction, 3-timed?, 3.5-seconds, 4-play/results
  const [region, setRegion]             = useState(null);
  const [direction, setDirectionMode]   = useState(null);         // 'state→capital' | 'capital→state'

  const [deck, setDeck]                 = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer]     = useState(false);

  const [correctCount, setCorrect]      = useState(0);
  const [incorrectCount, setIncorrect]  = useState(0);
  const [retries, setRetries]           = useState([]);

  /* ----- Timing ----- */
  const [timedMode, setTimedMode]       = useState(false);
  const [timeLimitStr, setTimeStr]      = useState('5');
  const [timeLimit, setTimeLimit]       = useState(5);
  const [timeLeft, setTimeLeft]         = useState(null);

  /* ----- Animation helpers & refs ----- */
  const [animateOut, setAnimateOut]     = useState(false);
  const [swipeDir, setSwipeDir]         = useState(null);         // 'left' | 'right'
  const [cardKey, setCardKey]           = useState(0);
  const hasMarkedRef   = useRef(false);
  const timeoutRef     = useRef(null);
  const intervalRef    = useRef(null);

  const currentCard = useMemo(() => deck[currentIndex], [deck, currentIndex]);
  const isFinished  = useMemo(() => currentIndex >= deck.length, [currentIndex, deck.length]);

  /* ----- Utility to clear timers ----- */
  const clearTimers = useCallback(() => {
    clearTimeout(timeoutRef.current);
    clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  }, []);

  /* ----- Mark right / wrong ----- */
  const mark = useCallback(
    (isCorrect) => {
      if (hasMarkedRef.current) return;
      hasMarkedRef.current = true;
      clearTimers();
      setSwipeDir(isCorrect ? 'right' : 'left');
      if (isCorrect) setCorrect((c) => c + 1);
      else {
        setIncorrect((c) => c + 1);
        setRetries((r) => [...r, currentCard]);
      }
      setTimeout(() => setAnimateOut(true), 0);
    },
    [clearTimers, currentCard]
  );

  /* ----- Force wrong (timer expired) ----- */
  const forceWrong = useCallback(() => {
    if (!hasMarkedRef.current) {
      setShowAnswer(true);
      setTimeout(() => mark(false), 750);
    }
  }, [mark]);

  /* ----- Timer effect ----- */
  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    if (
      step !== 4 ||
      !timedMode ||
      !currentCard ||
      showAnswer ||
      hasMarkedRef.current ||
      isFinished
    ) {
      clearTimers();
      return;
    }
    setTimeLeft(timeLimit);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimers();
          forceWrong();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    timeoutRef.current = setTimeout(forceWrong, timeLimit * 1000);
    return clearTimers;
  }, [step, timedMode, currentCard, showAnswer, timeLimit, clearTimers, forceWrong, isFinished]);

  /* ----- Build deck (all states in region) ----- */
  const generateDeck = useCallback(() => {
    const pool =
      region === 'Entire US'
        ? STATES
        : STATES.filter((s) => s.region === region);

    const shuffled = [...pool].sort(() => Math.random() - 0.5);

    const newDeck = shuffled.map(({ state, capital }) =>
      direction === 'state→capital'
        ? { question: state, answer: capital }
        : { question: capital, answer: state }
    );

    setDeck(newDeck);
    setCurrentIndex(0);
    setShowAnswer(false);
    setCorrect(0);
    setIncorrect(0);
    setRetries([]);
    hasMarkedRef.current = false;
    setSwipeDir(null);
    setAnimateOut(false);
    setCardKey((k) => k + 1);
    setTimeLeft(timedMode ? timeLimit : null);
  }, [region, direction, timedMode, timeLimit]);

  /* ----- Animation completion handler ----- */
  const onAnimationComplete = useCallback(() => {
    if (!animateOut) return;
    setCurrentIndex((idx) => idx + 1);
    setShowAnswer(false);
    setSwipeDir(null);
    setAnimateOut(false);
    hasMarkedRef.current = false;
    setCardKey((k) => k + 1);
  }, [animateOut]);

  const exitX = useMemo(
    () => (animateOut ? (swipeDir === 'left' ? -350 : 350) : 0),
    [animateOut, swipeDir]
  );

  /* ----- Card interaction ----- */
  const handleCardClick = () => {
    if (!showAnswer && !hasMarkedRef.current) setShowAnswer(true);
    if (timedMode) clearTimers();
  };

  const handleDragEnd = (_e, info) => {
    if (!showAnswer || hasMarkedRef.current) return;
    const { offset, velocity } = info;
    const thresh = 60;
    const vThresh = 150;
    if (Math.abs(offset.x) > thresh || Math.abs(velocity.x) > vThresh) {
      mark(offset.x > 0);
    }
  };

  /* ----------  Button helper ---------- */
  const Button = ({ children, onClick, style = {} }) => (
    <button style={{ ...BUTTON_STYLE, ...style }} onClick={onClick}>
      {children}
    </button>
  );

  /* ----------  Step-based UI ---------- */
  if (step === 0) {
    return (
      <div style={{ padding: 20, maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
        <h1>U.S. State Flashcards</h1>
        <h2>Welcome to the Flynn Family Flash Card App!</h2>
        <Button onClick={() => setStep(1)}>Begin</Button>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div style={{ padding: 20, maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
        <h1>Select Region</h1>
        {REGIONS.map((r) => (
          <Button key={r} onClick={() => { setRegion(r); setStep(2); }}>
            {r}
          </Button>
        ))}
      </div>
    );
  }

  if (step === 2) {
    return (
      <div style={{ padding: 20, maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
        <h1>Choose Direction</h1>
        <Button onClick={() => { setDirectionMode('state→capital'); setStep(3); }}>
          Show <strong>State</strong> –&gt; Answer Capital
        </Button>
        <Button onClick={() => { setDirectionMode('capital→state'); setStep(3); }}>
          Show <strong>Capital</strong> –&gt; Answer State
        </Button>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div style={{ padding: 20, maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
        <h1>Timed Mode?</h1>
        <Button
          onClick={() => {
            setTimedMode(false);
            generateDeck();
            setStep(4);
          }}
        >
          No
        </Button>
        <Button
          onClick={() => {
            setTimedMode(true);
            setStep(3.5);
          }}
        >
          Yes
        </Button>
      </div>
    );
  }

  if (step === 3.5) {
    return (
      <div style={{ padding: 20, maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
        <h1>Seconds per card:</h1>
        <input
          type="number"
          value={timeLimitStr}
          onChange={(e) => setTimeStr(e.target.value)}
          style={{ fontSize: 18, padding: 6, textAlign: 'center' }}
        />
        <div>
          <Button
            onClick={() => {
              setTimeLimit(parseInt(timeLimitStr, 10) || 5);
              generateDeck();
              setStep(4);
            }}
          >
            Start
          </Button>
        </div>
      </div>
    );
  }

  /* ----------  Gameplay & results ---------- */
  if (step === 4 && isFinished) {
    return (
      <div style={{ padding: 20, maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
        <h1>All done!</h1>
        <p>
          Correct: {correctCount} | Incorrect: {incorrectCount}
        </p>
        {retries.length > 0 && (
          <Button
            style={{ backgroundColor: '#faad14' }}
            onClick={() => {
              setDeck(retries);
              setRetries([]);
              setCurrentIndex(0);
              setShowAnswer(false);
              setCorrect(0);
              setIncorrect(0);
              hasMarkedRef.current = false;
              setSwipeDir(null);
              setAnimateOut(false);
              setCardKey((k) => k + 1);
            }}
          >
            Retry Missed
          </Button>
        )}
        <Button
          onClick={() => {
            setStep(1);
            setRegion(null);
            setDirectionMode(null);
            setDeck([]);
          }}
        >
          Start Over
        </Button>
      </div>
    );
  }

  if (step === 4 && currentCard && !isFinished) {
    return (
      <div style={{ padding: 20, maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
        <h1>U.S. State Flashcards</h1>
        {timedMode && timeLeft !== null && !hasMarkedRef.current && (
          <div
            style={{
              fontSize: 20,
              marginBottom: 10,
              color: timeLeft <= 3 && timeLeft > 0 ? 'red' : 'black',
            }}
          >
            ⏱ {timeLeft}s
          </div>
        )}
        {/* --- Card --- */}
        <div
          onClick={handleCardClick}
          style={{ position: 'relative', cursor: showAnswer ? 'default' : 'pointer' }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                animateOut && swipeDir === 'left'
                  ? 'rgba(255,0,0,0.25)'
                  : animateOut && swipeDir === 'right'
                  ? 'rgba(0,255,0,0.25)'
                  : 'transparent',
              borderRadius: 12,
              zIndex: 0,
              transition: SNAPPIER_BACKGROUND_TRANSITION,
            }}
          />
          <motion.div
            key={cardKey}
            drag={showAnswer && !hasMarkedRef.current ? 'x' : false}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            animate={{ x: exitX, opacity: animateOut ? 0 : 1 }}
            transition={SNAPPIER_TRANSITION_EXIT}
            onAnimationComplete={onAnimationComplete}
            style={{
              margin: '20px auto',
              width: 300,
              height: 200,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: 28,
              border: '4px solid #555',
              borderRadius: 12,
              backgroundColor: '#fffbe6',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              userSelect: 'none',
              zIndex: 1,
              position: 'relative',
              cursor: showAnswer && !hasMarkedRef.current ? 'grab' : 'pointer',
              touchAction: showAnswer && !hasMarkedRef.current ? 'none' : 'auto',
            }}
            whileTap={showAnswer ? { scale: 1.03, transition: SNAPPIER_TRANSITION_TAP } : {}}
          >
            {showAnswer ? currentCard.answer : currentCard.question}
          </motion.div>
        </div>

        {/* Right / Wrong buttons */}
        {showAnswer && !hasMarkedRef.current && !animateOut && (
          <div style={{ marginTop: 20 }}>
            <Button
              style={{ backgroundColor: '#ff4d4f' }}
              onClick={() => mark(false)}
            >
              Wrong
            </Button>
            <Button
              style={{ backgroundColor: '#52c41a' }}
              onClick={() => mark(true)}
            >
              Right
            </Button>
          </div>
        )}
      </div>
    );
  }

  /* Fallback */
  return (
    <div style={{ padding: 20, maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
      <h1>Loading…</h1>
    </div>
  );
}
