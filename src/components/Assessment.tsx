"use client";
import { useState, useEffect } from "react";
import { dataManager, type AssessmentScore } from "@/utils/dataManager";
import { useRouter, useSearchParams } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type Option = { value: string; label: string; color: string };

type Question = {
  text: string;
  options: Option[];
  scoring: Record<string, number>;
};

type AssessmentData = {
  name: string;
  questions: Question[];
};

const likertOptions5Bad = [
  {
    value: "strongly-disagree",
    label: "Strongly Disagree",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  {
    value: "disagree",
    label: "Disagree",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    value: "neutral",
    label: "Neutral",
    color: "bg-gray-100 text-gray-700 border-gray-200",
  },
  {
    value: "agree",
    label: "Agree",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  {
    value: "strongly-agree",
    label: "Strongly Agree",
    color: "bg-red-100 text-red-700 border-red-200",
  },
];

const likertScoring5To2 = {
  "strongly-disagree": 0,
  disagree: 0.5,
  neutral: 1,
  agree: 1.5,
  "strongly-agree": 2,
};

const hamAOptions = [
  {
    value: "0",
    label: "Not present",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  {
    value: "1",
    label: "Mild",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    value: "2",
    label: "Moderate",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  {
    value: "3",
    label: "Severe",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  {
    value: "4",
    label: "Very severe",
    color: "bg-red-100 text-red-700 border-red-200",
  },
];

const hamAScoring = { "0": 0, "1": 1, "2": 2, "3": 3, "4": 4 };

const cbclOptions3 = [
  {
    value: "0",
    label: "Not True",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  {
    value: "1",
    label: "Somewhat or Sometimes True",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  {
    value: "2",
    label: "Very True or Often True",
    color: "bg-red-100 text-red-700 border-red-200",
  },
];

const cbclScoring3 = { "0": 0, "1": 1, "2": 2 };

const iatOptions = [
  {
    value: "0",
    label: "Not Applicable",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  {
    value: "1",
    label: "Rarely",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    value: "2",
    label: "Occasionally",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  {
    value: "3",
    label: "Frequently",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  {
    value: "4",
    label: "Often",
    color: "bg-red-100 text-red-700 border-red-200",
  },
  {
    value: "5",
    label: "Always",
    color: "bg-red-600 text-white border-red-700",
  },
];

const iatScoring = { "0": 0, "1": 1, "2": 2, "3": 3, "4": 4, "5": 5 };

const lsasFearOptions = [
  {
    value: "0",
    label: "None",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  {
    value: "1",
    label: "Mild",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    value: "2",
    label: "Moderate",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  {
    value: "3",
    label: "Severe",
    color: "bg-red-100 text-red-700 border-red-200",
  },
];

const lsasAvoidanceOptions = [
  {
    value: "0",
    label: "Never (0%)",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  {
    value: "1",
    label: "Occasionally (1-33%)",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  {
    value: "2",
    label: "Often (33-67%)",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  {
    value: "3",
    label: "Usually (67-100%)",
    color: "bg-red-100 text-red-700 border-red-200",
  },
];

const lsasScoring = { "0": 0, "1": 1, "2": 2, "3": 3 };

const sixteenPFOptions = (aLabel: string, cLabel: string, bLabel?: string) => {
  const options = [
    {
      value: "a",
      label: `${aLabel}`,
      color: "bg-green-100 text-green-700 border-green-200",
    },
  ];

  // Only add the middle option if bLabel is provided
  if (bLabel !== undefined) {
    options.push({
      value: "b",
      label: `${bLabel}`,
      color: "bg-gray-100 text-gray-700 border-gray-200",
    });
  } else {
    options.push({
      value: "b",
      label: "?",
      color: "bg-gray-100 text-gray-700 border-gray-200",
    });
  }

  options.push({
    value: "c",
    label: `${cLabel}`,
    color: "bg-red-100 text-red-700 border-red-200",
  });

  return options;
};

const sixteenPFScoring = { a: 2, b: 1, c: 0 }; // General assumption; actual varies per item direction.

const hdrsScoring4 = { "0": 0, "1": 1, "2": 2, "3": 3, "4": 4 };

const hdrsScoring2 = { "0": 0, "1": 1, "2": 2 };

const assessmentQuestions: Record<string, AssessmentData> = {
  "assessment-1": {
    name: "Screen for Child Anxiety Related Disorders (SCARED)",
    questions: [
      {
        text: "1. When I feel frightened, it is hard for me to breathe",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "2. I get headaches when I am at school",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "3. I don’t like to be with people I don’t know well",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "4. I get scared if I sleep away from home",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "5. I worry about other people liking me",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "6. When I get frightened, I feel like passing out",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "7. I am nervous",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "8. I follow my mother or father wherever they go",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "9. People tell me that I look nervous",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "10. I feel nervous with people I don’t know well",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "11. I get stomachaches at school",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "12. When I get frightened, I feel like I am going crazy",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "13. I worry about sleeping alone",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "14. I worry about being as good as other kids",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "15. When I get frightened, I feel like things are not real",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "16. I have nightmares about something bad happening to my parents",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "17. I worry about going to school",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "18. When I get frightened, my heart beats fast",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "19. I get shaky",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "20. I have nightmares about something bad happening to me",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "21. I worry about things working out for me",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "22. When I get frightened, I sweat a lot",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "23. I am a worrier",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "24. I get really frightened for no reason at all",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "25. I am afraid to be alone in the house",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "26. It is hard for me to talk with people I don’t know well",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "27. When I get frightened, I feel like I am choking",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "28. People tell me that I worry too much",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "29. I don’t like to be away from my family",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "30. I am afraid of having anxiety (or panic) attacks",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "31. I worry that something bad might happen to my parents",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "32. I feel shy with people I don’t know well",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "33. I worry about what is going to happen in the future",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "34. When I get frightened, I feel like throwing up",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "35. I worry about how well I do things",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "36. I am scared to go to school",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "37. I worry about things that have already happened",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "38. When I get frightened, I feel dizzy",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "39. I feel nervous when I am with other children or adults and I have to do something while they watch me (for example: read aloud, speak, play a game, play a sport)",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "40. I feel nervous when I am going to parties, dances, or any place where there will be people that I don’t know well",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
      {
        text: "41. I am shy",
        options: likertOptions5Bad,
        scoring: likertScoring5To2,
      },
    ],
  },
  "assessment-2": {
    name: "Work-Life Balance Scale",
    questions: [
      {
        text: "1. My personal life suffers because of work",
        options: likertOptions5Bad,
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "2. My job makes personal life difficult",
        options: likertOptions5Bad,
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "3. I neglect personal needs because of work",
        options: likertOptions5Bad,
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "4. I put personal life on hold for work",
        options: likertOptions5Bad,
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "5. I miss personal activities because of work",
        options: likertOptions5Bad,
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "6. I struggle to juggle work and non-work",
        options: likertOptions5Bad,
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "7. I am unhappy with the amount of time for non-work activities",
        options: likertOptions5Bad,
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "8. My personal life drains me of energy for work",
        options: likertOptions5Bad,
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "9. I am too tired to be effective at work",
        options: likertOptions5Bad,
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "10. My work suffers because of my personal life",
        options: likertOptions5Bad,
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "11. It is hard to work because of personal matters",
        options: likertOptions5Bad,
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "12. My personal life gives me energy for my job",
        options: likertOptions5Bad,
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "13. My job gives me energy to pursue personal activities",
        options: likertOptions5Bad,
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "14. I have a better mood at work because of personal life",
        options: likertOptions5Bad,
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
      {
        text: "15. I have a better mood because of my job",
        options: likertOptions5Bad,
        scoring: {
          "strongly-disagree": 1,
          disagree: 2,
          neutral: 3,
          agree: 4,
          "strongly-agree": 5,
        },
      },
    ],
  },
  "assessment-3": {
    name: "Hamilton Anxiety Rating Scale (HAM-A)",
    questions: [
      {
        text: "1. Anxious mood (Worries, anticipation of the worst, fearful anticipation, irritability.)",
        options: hamAOptions,
        scoring: hamAScoring,
      },
      {
        text: "2. Tension (Feelings of tension, fatigability, startle response, moved to tears easily, trembling, feelings of restlessness, inability to relax.)",
        options: hamAOptions,
        scoring: hamAScoring,
      },
      {
        text: "3. Fears (Of dark, of strangers, of being left alone, of animals, of traffic, of crowds.)",
        options: hamAOptions,
        scoring: hamAScoring,
      },
      {
        text: "4. Insomnia (Difficulty in falling asleep, broken sleep, unsatisfying sleep and fatigue on waking, dreams, nightmares, night terrors.)",
        options: hamAOptions,
        scoring: hamAScoring,
      },
      {
        text: "5. Intellectual (Difficulty in concentration, poor memory.)",
        options: hamAOptions,
        scoring: hamAScoring,
      },
      {
        text: "6. Depressed mood (Loss of interest, lack of pleasure in hobbies, depression, early waking, diurnal swing.)",
        options: hamAOptions,
        scoring: hamAScoring,
      },
      {
        text: "7. Somatic (muscular) (Pains and aches, twitching, stiffness, myoclonic jerks, grinding of teeth, unsteady voice, increased muscular tone.)",
        options: hamAOptions,
        scoring: hamAScoring,
      },
      {
        text: "8. Somatic (sensory) (Tinnitus, blurring of vision, hot and cold flushes, feelings of weakness, pricking sensation.)",
        options: hamAOptions,
        scoring: hamAScoring,
      },
      {
        text: "9. Cardiovascular symptoms (Tachycardia, palpitations, pain in chest, throbbing of vessels, fainting feelings, missing beat.)",
        options: hamAOptions,
        scoring: hamAScoring,
      },
      {
        text: "10. Respiratory symptoms (Pressure or constriction in chest, choking feelings, sighing, dyspnea.)",
        options: hamAOptions,
        scoring: hamAScoring,
      },
      {
        text: "11. Gastrointestinal symptoms (Difficulty in swallowing, wind abdominal pain, burning sensations, abdominal fullness, nausea, vomiting, borborygmi, looseness of bowels, loss of weight, constipation.)",
        options: hamAOptions,
        scoring: hamAScoring,
      },
      {
        text: "12. Genitourinary symptoms (Frequency of micturition, urgency of micturition, amenorrhea, menorrhagia, development of frigidity, premature ejaculation, loss of libido, impotence.)",
        options: hamAOptions,
        scoring: hamAScoring,
      },
      {
        text: "13. Autonomic symptoms (Dry mouth, flushing, pallor, tendency to sweat, giddiness, tension headache, raising of hair.)",
        options: hamAOptions,
        scoring: hamAScoring,
      },
      {
        text: "14. Behavior at interview (Fidgeting, restlessness or pacing, tremor of hands, furrowed brow, strained face, sighing or rapid respiration, facial pallor, swallowing, etc.)",
        options: hamAOptions,
        scoring: hamAScoring,
      },
    ],
  },
  "assessment-4": {
    name: "Hamilton Depression Rating Scale (HDRS)",
    questions: [
      {
        text: "1. DEPRESSED MOOD (sadness, hopeless, helpless, worthless)",
        options: [
          {
            value: "0",
            label: "Absent",
            color: "bg-green-100 text-green-700 border-green-200",
          },
          {
            value: "1",
            label: "These feeling states indicated only on questioning.",
            color: "bg-blue-100 text-blue-700 border-blue-200",
          },
          {
            value: "2",
            label: "These feeling states spontaneously reported verbally.",
            color: "bg-yellow-100 text-yellow-700 border-yellow-200",
          },
          {
            value: "3",
            label:
              "Communicates feeling states non-verbally, i.e. through facial expression, posture, voice and tendency to weep.",
            color: "bg-orange-100 text-orange-700 border-orange-200",
          },
          {
            value: "4",
            label:
              "Patient reports virtually only these feeling states in his/her spontaneous verbal and non-verbal communication",
            color: "bg-red-100 text-red-700 border-red-200",
          },
        ],
        scoring: hdrsScoring4,
      },
      {
        text: "2. FEELINGS OF GUILT",
        options:[
          {
            value: "0",
            label: "Absent",
            color: "bg-green-100 text-green-700 border-green-200",
          },
          {
            value: "1",
            label: "Self reproach, feels he/she has let people down.",
            color: "bg-blue-100 text-blue-700 border-blue-200",
          },
          {
            value: "2",
            label: " Ideas of guilt or rumination over past errors or sinful deeds.",
            color: "bg-yellow-100 text-yellow-700 border-yellow-200",
          },
          {
            value: "3",
            label:
              "Present illness is a punishment. Delusions of guilt.",
            color: "bg-orange-100 text-orange-700 border-orange-200",
          },
          {
            value: "4",
            label:
              "Hears accusatory or denunciatory voices and/or experiences threatening visual hallucinations.",
            color: "bg-red-100 text-red-700 border-red-200",
          },
        ],
        scoring: hdrsScoring4,
      },
      {
        "text": "3. SUICIDE",
        "options": [
          { "value": "0", "label": "Absent.", "color": "bg-green-100 text-green-700 border-green-200" },
          { "value": "1", "label": "Feels life is not worth living.", "color": "bg-blue-100 text-blue-700 border-blue-200" },
          { "value": "2", "label": "Wishes he/she were dead or has thoughts of death.", "color": "bg-yellow-100 text-yellow-700 border-yellow-200" },
          { "value": "3", "label": "Ideas or gestures of suicide.", "color": "bg-orange-100 text-orange-700 border-orange-200" },
          { "value": "4", "label": "Attempts at suicide (any serious attempt rates 4).", "color": "bg-red-100 text-red-700 border-red-200" }
        ],
        "scoring": hdrsScoring4
      },
      {
        "text": "4. INSOMNIA: EARLY IN THE NIGHT",
        "options": [
          { "value": "0", "label": "No difficulty falling asleep.", "color": "bg-green-100 text-green-700 border-green-200" },
          { "value": "1", "label": "Occasional difficulty falling asleep (more than 1/2 hour).", "color": "bg-blue-100 text-blue-700 border-blue-200" },
          { "value": "2", "label": "Nightly difficulty falling asleep.", "color": "bg-yellow-100 text-yellow-700 border-yellow-200" }
        ],
        "scoring": hdrsScoring2
      },
      {
        "text": "5. INSOMNIA: MIDDLE OF THE NIGHT",
        "options": [
          { "value": "0", "label": "No difficulty.", "color": "bg-green-100 text-green-700 border-green-200" },
          { "value": "1", "label": "Restless and disturbed during the night.", "color": "bg-blue-100 text-blue-700 border-blue-200" },
          { "value": "2", "label": "Waking during the night; any getting out of bed rates 2.", "color": "bg-yellow-100 text-yellow-700 border-yellow-200" }
        ],
        "scoring": hdrsScoring2
      },
      {
        "text": "6. INSOMNIA: EARLY HOURS OF THE MORNING",
        "options": [
          { "value": "0", "label": "No difficulty.", "color": "bg-green-100 text-green-700 border-green-200" },
          { "value": "1", "label": "Waking early but goes back to sleep.", "color": "bg-blue-100 text-blue-700 border-blue-200" },
          { "value": "2", "label": "Unable to fall asleep again after early waking.", "color": "bg-yellow-100 text-yellow-700 border-yellow-200" }
        ],
        "scoring": hdrsScoring2
      },
      {
        "text": "7. WORK AND ACTIVITIES",
        "options": [
          { "value": "0", "label": "No difficulty.", "color": "bg-green-100 text-green-700 border-green-200" },
          { "value": "1", "label": "Thoughts and feelings of incapacity, fatigue or weakness related to activities.", "color": "bg-blue-100 text-blue-700 border-blue-200" },
          { "value": "2", "label": "Loss of interest in activities, hobbies or work.", "color": "bg-yellow-100 text-yellow-700 border-yellow-200" },
          { "value": "3", "label": "Decrease in activity time or productivity.", "color": "bg-orange-100 text-orange-700 border-orange-200" },
          { "value": "4", "label": "Stopped working due to illness, no activities except routine chores.", "color": "bg-red-100 text-red-700 border-red-200" }
        ],
        "scoring": hdrsScoring4
      },
            {
        "text": "8. RETARDATION (slowness of thought and speech, impaired ability to concentrate, decreased motor activity)",
        "options": [
          { "value": "0", "label": "Normal speech and thought.", "color": "bg-green-100 text-green-700 border-green-200" },
          { "value": "1", "label": "Slight retardation during the interview.", "color": "bg-blue-100 text-blue-700 border-blue-200" },
          { "value": "2", "label": "Obvious retardation during the interview.", "color": "bg-yellow-100 text-yellow-700 border-yellow-200" },
          { "value": "3", "label": "Interview difficult.", "color": "bg-orange-100 text-orange-700 border-orange-200" },
          { "value": "4", "label": "Complete stupor.", "color": "bg-red-100 text-red-700 border-red-200" }
        ],
        "scoring": hdrsScoring4
      },
      {
        "text": "9. AGITATION",
        "options": [
          { "value": "0", "label": "None.", "color": "bg-green-100 text-green-700 border-green-200" },
          { "value": "1", "label": "Fidgetiness.", "color": "bg-blue-100 text-blue-700 border-blue-200" },
          { "value": "2", "label": "Playing with hands, hair, etc.", "color": "bg-yellow-100 text-yellow-700 border-yellow-200" },
          { "value": "3", "label": "Moving about, can't sit still.", "color": "bg-orange-100 text-orange-700 border-orange-200" },
          { "value": "4", "label": "Hand-wringing, nail-biting, hair-pulling, biting of lips.", "color": "bg-red-100 text-red-700 border-red-200" }
        ],
        "scoring": hdrsScoring4
      },
      {
        "text": "10. ANXIETY PSYCHIC",
        "options": [
          { "value": "0", "label": "No difficulty.", "color": "bg-green-100 text-green-700 border-green-200" },
          { "value": "1", "label": "Subjective tension and irritability.", "color": "bg-blue-100 text-blue-700 border-blue-200" },
          { "value": "2", "label": "Worrying about minor matters.", "color": "bg-yellow-100 text-yellow-700 border-yellow-200" },
          { "value": "3", "label": "Apprehensive attitude apparent in face or speech.", "color": "bg-orange-100 text-orange-700 border-orange-200" },
          { "value": "4", "label": "Fears expressed without questioning.", "color": "bg-red-100 text-red-700 border-red-200" }
        ],
        "scoring": hdrsScoring4
      },
      {
        "text": "11. ANXIETY SOMATIC (physiological signs such as dry mouth, palpitations, sweating, etc.)",
        "options": [
          { "value": "0", "label": "Absent.", "color": "bg-green-100 text-green-700 border-green-200" },
          { "value": "1", "label": "Mild.", "color": "bg-blue-100 text-blue-700 border-blue-200" },
          { "value": "2", "label": "Moderate.", "color": "bg-yellow-100 text-yellow-700 border-yellow-200" },
          { "value": "3", "label": "Severe.", "color": "bg-orange-100 text-orange-700 border-orange-200" },
          { "value": "4", "label": "Incapacitating.", "color": "bg-red-100 text-red-700 border-red-200" }
        ],
        "scoring": hdrsScoring4
      },
      {
        "text": "12. SOMATIC SYMPTOMS GASTRO-INTESTINAL",
        "options": [
          { "value": "0", "label": "None.", "color": "bg-green-100 text-green-700 border-green-200" },
          { "value": "1", "label": "Loss of appetite but eating without staff encouragement. Heavy feeling in abdomen.", "color": "bg-blue-100 text-blue-700 border-blue-200" },
          { "value": "2", "label": "Difficulty eating without urging. Needs laxatives/medication.", "color": "bg-yellow-100 text-yellow-700 border-yellow-200" }
        ],
        "scoring": hdrsScoring2
      },
      {
        "text": "13. GENERAL SOMATIC SYMPTOMS",
        "options": [
          { "value": "0", "label": "None.", "color": "bg-green-100 text-green-700 border-green-200" },
          { "value": "1", "label": "Heaviness in limbs, backache, fatigue.", "color": "bg-blue-100 text-blue-700 border-blue-200" },
          { "value": "2", "label": "Any clear-cut symptom rated 2.", "color": "bg-yellow-100 text-yellow-700 border-yellow-200" }
        ],
        "scoring": hdrsScoring2
      },
      {
        "text": "14. GENITAL SYMPTOMS (loss of libido, menstrual problems)",
        "options": [
          { "value": "0", "label": "Absent.", "color": "bg-green-100 text-green-700 border-green-200" },
          { "value": "1", "label": "Mild.", "color": "bg-blue-100 text-blue-700 border-blue-200" },
          { "value": "2", "label": "Severe.", "color": "bg-yellow-100 text-yellow-700 border-yellow-200" }
        ],
        "scoring": hdrsScoring2
      },
            {
        "text": "15. HYPOCHONDRIASIS",
        "options": [
          { "value": "0", "label": "Not present.", "color": "bg-green-100 text-green-700 border-green-200" },
          { "value": "1", "label": "Self-absorption (bodily).", "color": "bg-blue-100 text-blue-700 border-blue-200" },
          { "value": "2", "label": "Preoccupation with health.", "color": "bg-yellow-100 text-yellow-700 border-yellow-200" },
          { "value": "3", "label": "Frequent complaints, requests for help, etc.", "color": "bg-orange-100 text-orange-700 border-orange-200" },
          { "value": "4", "label": "Hypochondriacal delusions.", "color": "bg-red-100 text-red-700 border-red-200" }
        ],
        "scoring": hdrsScoring4
      },
      {
        "text": "16. LOSS OF WEIGHT (Rate either a OR b)",
        "options": [
          { "value": "0", "label": "No weight loss OR < 1 lb loss in a week.", "color": "bg-green-100 text-green-700 border-green-200" },
          { "value": "1", "label": "Probable weight loss associated with illness OR > 1 lb loss in a week.", "color": "bg-blue-100 text-blue-700 border-blue-200" },
          { "value": "2", "label": "Definite weight loss according to patient OR > 2 lb loss in a week.", "color": "bg-yellow-100 text-yellow-700 border-yellow-200" },
          { "value": "3", "label": "Not assessed.", "color": "bg-orange-100 text-orange-700 border-orange-200" }
        ],
        "scoring": hdrsScoring4
      },
      {
        "text": "17. INSIGHT",
        "options": [
          { "value": "0", "label": "Acknowledges being depressed and ill.", "color": "bg-green-100 text-green-700 border-green-200" },
          { "value": "1", "label": "Acknowledges illness but attributes cause to external factors.", "color": "bg-blue-100 text-blue-700 border-blue-200" },
          { "value": "2", "label": "Denies being ill at all.", "color": "bg-yellow-100 text-yellow-700 border-yellow-200" },
          { "value": "3", "label": "Not assessed.", "color": "bg-orange-100 text-orange-700 border-orange-200" }
        ],
        "scoring": hdrsScoring4
      },
    ],
  },
  "assessment-5": {
    name: "Child Behavior Checklist (CBCL) for Ages 6-18",
    questions: [
      {
        text: "1. Acts too young for his/her age",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "2. Drinks alcohol without parents approval (describe)",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "3. Argues a lot",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "4. Fails to finish things he/she starts",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "5. There is very little he/she enjoys",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "6. Bowel movements outside toilet",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "7. Bragging, boasting",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "8. Can t concentrate, can t pay attention for long",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "9. Can t get his/her mind off certain thoughts; obsessions (describe)",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "10. Can t sit still, restless, or hyperactive",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "11. Clings to adults or too dependent",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "12. Complains of loneliness",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "13. Confused or seems to be in a fog",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "14. Cries a lot",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "15. Cruel to animals",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "16. Cruelty, bullying, or meanness to others",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "17. Daydreams or gets lost in his/her thoughts",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "18. Deliberately harms self or attempts suicide",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "19. Demands a lot of attention",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "20. Destroys his/her own things",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "21. Destroys things belonging to his/her family or others",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "22. Disobedient at home",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "23. Disobedient at school",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "24. Doesn t eat well",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "25. Doesn t get along with other kids",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "26. Doesn t seem to feel guilty after misbehaving",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "27. Easily jealous",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "28. Breaks rules at home, school, or elsewhere",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "29. Fears certain animals, situations, or places, other than school (describe)",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "30. Fears going to school",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "31. Fears he/she might think or do something bad",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "32. Feels he/she has to be perfect",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "33. Feels or complains that no one loves him/ her",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "34. Feels others are out to get him/her",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "35. Feels worthless or inferior",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "36. Gets hurt a lot, accident-prone",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "37. Gets in many fights",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "38. Gets teased a lot",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "39. Hangs around with others who get in trouble",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "40. Hears sound or voices that aren t there (describe)",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "41. Impulsive or acts without thinking",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "42. Would rather be alone than with others",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "43. Lying or cheating",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "44. Bites fingernails",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "45. Nervous, highstrung, or tense",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "46. Nervous movements or twitching (describe)",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "47. Nightmares",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "48. Not liked by other kids",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "49. Constipated, doesn t move bowels",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "50. Too fearful or anxious",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "51. Feels dizzy or lightheaded",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "52. Feels too guilty",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "53. Overeating",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "54. Overtired without good reason",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "55. Overweight",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "56a. Physical problems without known medical cause: Aches or pains (not stomach or headaches)",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "56b. Headaches",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "56c. Nausea, feels sick",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "56d. Problems with eyes (not if corrected by glasses) (describe)",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "56e. Rashes or other skin problems",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "56f. Stomachaches",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "56g. Vomiting, throwing up",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "56h. Other (describe)",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "57. Physically attacks people",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "58. Picks nose, skin, or other parts of body (describe)",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "59. Plays with own sex parts in public",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "60. Plays with own sex parts too much",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "61. Poor school work",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "62. Poorly coordinated or clumsy",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "63. Prefers being with older kids",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "64. Prefers being with younger kids",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "65. Refuses to talk",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "66. Repeats certain acts over and over; compulsions (describe)",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "67. Runs away from home",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "68. Screams a lot",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "69. Secretive, keeps things to self",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "70. Sees things that aren't there (describe)",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "71. Self-conscious or easily embarrassed",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "72. Sets fires",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "73. Sexual problems (describe)",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "74. Showing off or clowning",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "75. Too shy or timid",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "76. Sleeps less than most kids",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "77. Sleeps more than most kids during day and/or night (describe)",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "78. Inattentive or easily distracted",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "79. Speech problem (describe)",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "80. Stands speech (describe)",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "81. Steals at home",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "82. Steals outside the home",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "83. Stores up too many things he/she doesn't need (describe)",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "84. Strange behavior (describe)",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "85. Strange ideas (describe)",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "86. Stubborn, sullen, or irritable",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "87. Sudden changes in mood or feelings",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "88. Sulks a lot",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "89. Suspicious",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "90. Swearing or obscene language",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "91. Talks about killing self",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "92. Talks or walks in sleep (describe)",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "93. Talks too much",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "94. Teases a lot",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "95. Temper tantrums or hot temper",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "96. Thinks about sex too much",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "97. Threatens people",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "98. Thumb-sucking",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "99. Smokes, chews, or sniffs tobacco",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "100. Trouble sleeping (describe)",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "101. Truancy, skips school",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "102. Underactive, slow moving, or lacks energy",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "103. Unhappy, sad, or depressed",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "104. Unusually loud",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "105. Uses drugs for nonmedical purposes don't include alcohol or tobacco) (describe)",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "106. Vandalism",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "107. Wets self during the day",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "108. Wets the bed",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "109. Whining",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "110. Wishes to be of opposite sex",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "111. Withdrawn, doesn t get involved with others",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
      {
        text: "112. Worries",
        options: cbclOptions3,
        scoring: cbclScoring3,
      },
    ],
  },
  "assessment-6": {
    name: "Internet Addiction Test (IAT)",
    questions: [
      {
        text: "1. How often do you find that you stay online longer than you intended?",
        options: iatOptions,
        scoring: iatScoring,
      },
      {
        text: "2. How often do you neglect household chores to spend more time online?",
        options: iatOptions,
        scoring: iatScoring,
      },
      {
        text: "3. How often do you prefer the excitement of the Internet to intimacy with your partner?",
        options: iatOptions,
        scoring: iatScoring,
      },
      {
        text: "4. How often do you form new relationships with fellow online users?",
        options: iatOptions,
        scoring: iatScoring,
      },
      {
        text: "5. How often do others in your life complain to you about the amount of time you spend online?",
        options: iatOptions,
        scoring: iatScoring,
      },
      {
        text: "6. How often do your grades or school work suffer because of the amount of time you spend online?",
        options: iatOptions,
        scoring: iatScoring,
      },
      {
        text: "7. How often do you check your email before something else that you need to do?",
        options: iatOptions,
        scoring: iatScoring,
      },
      {
        text: "8. How often does your job performance or productivity suffer because of the Internet?",
        options: iatOptions,
        scoring: iatScoring,
      },
      {
        text: "9. How often do you become defensive or secretive when anyone asks you what you do online?",
        options: iatOptions,
        scoring: iatScoring,
      },
      {
        text: "10. How often do you block out disturbing thoughts about your life with soothing thoughts of the Internet?",
        options: iatOptions,
        scoring: iatScoring,
      },
      {
        text: "11. How often do you find yourself anticipating when you will go online again?",
        options: iatOptions,
        scoring: iatScoring,
      },
      {
        text: "12. How often do you fear that life without the Internet would be boring, empty, and joyless?",
        options: iatOptions,
        scoring: iatScoring,
      },
      {
        text: "13. How often do you snap, yell, or act annoyed if someone bothers you while you are online?",
        options: iatOptions,
        scoring: iatScoring,
      },
      {
        text: "14. How often do you lose sleep due to being online?",
        options: iatOptions,
        scoring: iatScoring,
      },
      {
        text: "15. How often do you feel preoccupied with the Internet when off-line, or fantasize about being online?",
        options: iatOptions,
        scoring: iatScoring,
      },
      {
        text: '16. How often do you find yourself saying "just a few more minutes" when online?',
        options: iatOptions,
        scoring: iatScoring,
      },
      {
        text: "17. How often do you try to cut down the amount of time you spend online and fail?",
        options: iatOptions,
        scoring: iatScoring,
      },
      {
        text: "18. How often do you try to hide how long you've been online?",
        options: iatOptions,
        scoring: iatScoring,
      },
      {
        text: "19. How often do you choose to spend more time online over going out with others?",
        options: iatOptions,
        scoring: iatScoring,
      },
      {
        text: "20. How often do you feel depressed, moody, or nervous when you are off-line, which goes away once you are back online?",
        options: iatOptions,
        scoring: iatScoring,
      },
    ],
  },
  "assessment-7": {
    name: "Liebowitz Social Anxiety Scale (LSAS-SR)",
    questions: [
      {
        text: "1. Fear or anxiety for telephoning in public (p)",
        options: lsasFearOptions,
        scoring: lsasScoring,
      },
      {
        text: "1. Avoidance for telephoning in public (p)",
        options: lsasAvoidanceOptions,
        scoring: lsasScoring,
      },
      {
        text: "2. Fear or anxiety for participating in small groups (p)",
        options: lsasFearOptions,
        scoring: lsasScoring,
      },
      {
        text: "2. Avoidance for participating in small groups (p)",
        options: lsasAvoidanceOptions,
        scoring: lsasScoring,
      },
      {
        text: "3. Fear or anxiety for eating in public places (p)",
        options: lsasFearOptions,
        scoring: lsasScoring,
      },
      {
        text: "3. Avoidance for eating in public places (p)",
        options: lsasAvoidanceOptions,
        scoring: lsasScoring,
      },
      {
        text: "4. Fear or anxiety for drinking with others in public places (p)",
        options: lsasFearOptions,
        scoring: lsasScoring,
      },
      {
        text: "4. Avoidance for drinking with others in public places (p)",
        options: lsasAvoidanceOptions,
        scoring: lsasScoring,
      },
      {
        text: "5. Fear or anxiety for talking to people in authority (s)",
        options: lsasFearOptions,
        scoring: lsasScoring,
      },
      {
        text: "5. Avoidance for talking to people in authority (s)",
        options: lsasAvoidanceOptions,
        scoring: lsasScoring,
      },
      {
        text: "6. Fear or anxiety for acting, performing or giving a talk in front of an audience (p)",
        options: lsasFearOptions,
        scoring: lsasScoring,
      },
      {
        text: "6. Avoidance for acting, performing or giving a talk in front of an audience (p)",
        options: lsasAvoidanceOptions,
        scoring: lsasScoring,
      },
      {
        text: "7. Fear or anxiety for going to a party (s)",
        options: lsasFearOptions,
        scoring: lsasScoring,
      },
      {
        text: "7. Avoidance for going to a party (s)",
        options: lsasAvoidanceOptions,
        scoring: lsasScoring,
      },
      {
        text: "8. Fear or anxiety for working while being observed (p)",
        options: lsasFearOptions,
        scoring: lsasScoring,
      },
      {
        text: "8. Avoidance for working while being observed (p)",
        options: lsasAvoidanceOptions,
        scoring: lsasScoring,
      },
      {
        text: "9. Fear or anxiety for writing while being observed (p)",
        options: lsasFearOptions,
        scoring: lsasScoring,
      },
      {
        text: "9. Avoidance for writing while being observed (p)",
        options: lsasAvoidanceOptions,
        scoring: lsasScoring,
      },
      {
        text: "10. Fear or anxiety for calling someone you don’t know very well (s)",
        options: lsasFearOptions,
        scoring: lsasScoring,
      },
      {
        text: "10. Avoidance for calling someone you don’t know very well (s)",
        options: lsasAvoidanceOptions,
        scoring: lsasScoring,
      },
      {
        text: "11. Fear or anxiety for talking with people you don’t know very well (s)",
        options: lsasFearOptions,
        scoring: lsasScoring,
      },
      {
        text: "11. Avoidance for talking with people you don’t know very well (s)",
        options: lsasAvoidanceOptions,
        scoring: lsasScoring,
      },
      {
        text: "12. Fear or anxiety for meeting strangers (s)",
        options: lsasFearOptions,
        scoring: lsasScoring,
      },
      {
        text: "12. Avoidance for meeting strangers (s)",
        options: lsasAvoidanceOptions,
        scoring: lsasScoring,
      },
      {
        text: "13. Fear or anxiety for urinating in a public bathroom (p)",
        options: lsasFearOptions,
        scoring: lsasScoring,
      },
      {
        text: "13. Avoidance for urinating in a public bathroom (p)",
        options: lsasAvoidanceOptions,
        scoring: lsasScoring,
      },
      {
        text: "14. Fear or anxiety for entering a room when others are already seated (p)",
        options: lsasFearOptions,
        scoring: lsasScoring,
      },
      {
        text: "14. Avoidance for entering a room when others are already seated (p)",
        options: lsasAvoidanceOptions,
        scoring: lsasScoring,
      },
      {
        text: "15. Fear or anxiety for being the centre of attention (s)",
        options: lsasFearOptions,
        scoring: lsasScoring,
      },
      {
        text: "15. Avoidance for being the centre of attention (s)",
        options: lsasAvoidanceOptions,
        scoring: lsasScoring,
      },
      {
        text: "16. Fear or anxiety for speaking up at a meeting (p)",
        options: lsasFearOptions,
        scoring: lsasScoring,
      },
      {
        text: "16. Avoidance for speaking up at a meeting (p)",
        options: lsasAvoidanceOptions,
        scoring: lsasScoring,
      },
      {
        text: "17. Fear or anxiety for taking a test (p)",
        options: lsasFearOptions,
        scoring: lsasScoring,
      },
      {
        text: "17. Avoidance for taking a test (p)",
        options: lsasAvoidanceOptions,
        scoring: lsasScoring,
      },
      {
        text: "18. Fear or anxiety for expressing a disagreement or disapproval to people you don’t know very well (s)",
        options: lsasFearOptions,
        scoring: lsasScoring,
      },
      {
        text: "18. Avoidance for expressing a disagreement or disapproval to people you don’t know very well (s)",
        options: lsasAvoidanceOptions,
        scoring: lsasScoring,
      },
      {
        text: "19. Fear or anxiety for looking at people you don’t know very well in the eyes (s)",
        options: lsasFearOptions,
        scoring: lsasScoring,
      },
      {
        text: "19. Avoidance for looking at people you don’t know very well in the eyes (s)",
        options: lsasAvoidanceOptions,
        scoring: lsasScoring,
      },
      {
        text: "20. Fear or anxiety for giving a report to a group (p)",
        options: lsasFearOptions,
        scoring: lsasScoring,
      },
      {
        text: "20. Avoidance for giving a report to a group (p)",
        options: lsasAvoidanceOptions,
        scoring: lsasScoring,
      },
      {
        text: "21. Fear or anxiety for trying to pick up someone (p)",
        options: lsasFearOptions,
        scoring: lsasScoring,
      },
      {
        text: "21. Avoidance for trying to pick up someone (p)",
        options: lsasAvoidanceOptions,
        scoring: lsasScoring,
      },
      {
        text: "22. Fear or anxiety for returning goods to a store (s)",
        options: lsasFearOptions,
        scoring: lsasScoring,
      },
      {
        text: "22. Avoidance for returning goods to a store (s)",
        options: lsasAvoidanceOptions,
        scoring: lsasScoring,
      },
      {
        text: "23. Fear or anxiety for giving a party (s)",
        options: lsasFearOptions,
        scoring: lsasScoring,
      },
      {
        text: "23. Avoidance for giving a party (s)",
        options: lsasAvoidanceOptions,
        scoring: lsasScoring,
      },
      {
        text: "24. Fear or anxiety for resisting a high pressure salesperson (s)",
        options: lsasFearOptions,
        scoring: lsasScoring,
      },
      {
        text: "24. Avoidance for resisting a high pressure salesperson (s)",
        options: lsasAvoidanceOptions,
        scoring: lsasScoring,
      },
    ],
  },
  "assessment-8": {
  name: "16PF Questionnaire",
  questions: [
    {
      text: "1. I'd enjoy being a counselor more than being an architect.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "2. I believe more in",
      options: sixteenPFOptions(
        "Being properly serious in everyday life",
        "The saying \"laugh and be merry\" most of the time"
      ),
      scoring: sixteenPFScoring,
    },
    {
      text: "3. I usually enjoy spending time talking with friends about social events or parties.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "4. In joining a new group, I usually seem to fit in right away.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "5. There's usually a big difference between what people say they'll do and what they actually do.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "6. My friends think I'm slightly absent-minded and not always practical.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "7. A lot of people will \"stab you in the back\" in order to get ahead of themselves.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "8. I get into trouble because I sometimes pursue my own ideas without talking them over with the people involved.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "9. I find it easy to talk about my life, even about things that others might consider quite personal.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "10. I am willing to help people.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "11. I prefer to:",
      options: sixteenPFOptions(
        "Talk about my problems with my friends",
        "Keep them to myself"
      ),
      scoring: sixteenPFScoring,
    },
    {
      text: "12. I tend to be too sensitive and worry too much about something I've done.",
      options: sixteenPFOptions("Hardly ever", "Often"),
      scoring: sixteenPFScoring,
    },
    {
      text: "13. I'd prefer to deal with people who are:",
      options: sixteenPFOptions(
        "Conventional and polite in what they say",
        "Direct and speak up about problems they see"
      ),
      scoring: sixteenPFScoring,
    },
    {
      text: "14. If people act as if they dislike me:",
      options: sixteenPFOptions("It doesn't upset me", "I usually feel hurt"),
      scoring: sixteenPFScoring,
    },
    {
      text: "15. If I had to cook or build something, I'd follow the directions exactly.",
      options: sixteenPFOptions(
        "True, why take chances",
        "False, I'd probably try to make it more interesting"
      ),
      scoring: sixteenPFScoring,
    },
    {
      text: "16. I feel that:",
      options: sixteenPFOptions(
        "Some jobs just don't have to be done as carefully as others",
        "Any job should be done thoroughly if you do it at all"
      ),
      scoring: sixteenPFScoring,
    },
    {
      text: "17. I usually like to do my planning alone, without interruptions and suggestions from others.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "18. It's hard to be patient when people criticize me.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "19. If my carefully made plans have to be changed because of other people:",
      options: sixteenPFOptions("It annoys me", "I'm happy to change plans"),
      scoring: sixteenPFScoring,
    },
    {
      text: "20. I would rather be:",
      options: sixteenPFOptions(
        "In a business office, organizing and seeing people",
        "An architect, drawing plans in a quiet room"
      ),
      scoring: sixteenPFScoring,
    },
    {
      text: "21. When one small thing after another goes wrong, I:",
      options: sixteenPFOptions("Feel as though I can't cope", "Just go on as usual"),
      scoring: sixteenPFScoring,
    },
    {
      text: "22. In a situation where I'm in charge, I feel comfortable giving people directions.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "23. I'd prefer to spend an evening:",
      options: sixteenPFOptions("Working on a quiet hobby", "At a lively party"),
      scoring: sixteenPFScoring,
    },
    {
      text: "24. I value respect for rules and good manners more than easy living.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "25. I am shy and cautious about making friends with new people.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "26. If I could, I would rather exercise by:",
      options: sixteenPFOptions("Fencing or dancing", "Wrestling or baseball"),
      scoring: sixteenPFScoring,
    },
    {
      text: "27. It would be more interesting to be a musician than a mechanic.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "28. People form opinions about me too quickly.",
      options: sixteenPFOptions("Hardly ever", "Often"),
      scoring: sixteenPFScoring,
    },
    {
      text: "29. I'm the type of person who:",
      options: sixteenPFOptions(
        "Is always doing practical things that need to be done",
        "Daydreams and thinks up things on my own"
      ),
      scoring: sixteenPFScoring,
    },
    {
      text: "30. My thoughts tend to be about sensible, down-to-earth things.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "31. I tend to be reserved and keep my problems to myself.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "32. After I make up my mind about something, I still keep thinking about whether it's right or wrong.",
      options: sixteenPFOptions("Usually true", "Usually false"),
      scoring: sixteenPFScoring,
    },
    {
      text: "33. I don't really like people who are 'different' or unusual.",
      options: sixteenPFOptions(
        "True, I usually don't",
        "False, I usually find them interesting"
      ),
      scoring: sixteenPFScoring,
    },
    {
      text: "34. I'm more interested in:",
      options: sixteenPFOptions(
        "Seeking personal meaning in life",
        "A secure job that pays well"
      ),
      scoring: sixteenPFScoring,
    },
    {
      text: "35. When people get angry at each other, it usually bothers me more than most people.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "36. I prefer games where:",
      options: sixteenPFOptions(
        "You're on a team or have a partner",
        "People are on their own"
      ),
      scoring: sixteenPFScoring,
    },
    {
      text: "37. I frequently have periods where it's hard to stop a mood of self-pity.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "38. The best hours of the day are usually when I'm alone with my own thoughts and projects.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "39. I always keep my belongings in tip-top shape.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "40. Sometimes I get frustrated with people too quickly.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "41. If people are doing something wrong, I usually tell them what I think.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "42. I feel that my emotional needs are:",
      options: sixteenPFOptions("Not too satisfied", "Well satisfied"),
      scoring: sixteenPFScoring,
    },
    {
      text: "43. I tend to get embarrassed if I suddenly become the center of attention in a social group.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "44. I get annoyed when people insist that I follow every single minor safety rule.",
      options: sixteenPFOptions("True, it's not always necessary", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "45. Starting conversations with strangers:",
      options: sixteenPFOptions("Never gives me any trouble", "Is hard for me"),
      scoring: sixteenPFScoring,
    },
    {
      text: "46. If I worked on a newspaper, I'd rather deal with:",
      options: sixteenPFOptions("Movie or book reviews", "Sports or politics"),
      scoring: sixteenPFScoring,
    },
    {
      text: "47. I let little things upset me more than they should.",
      options: sixteenPFOptions("Sometimes", "Rarely"),
      scoring: sixteenPFScoring,
    },
    {
      text: "48. It's wise to be on guard against smooth talkers because they might take advantage of you.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "49. I'd rather stop in the street to watch an artist painting than a building being constructed.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "50. People are lazy on a job if they can get away with it.",
      options: sixteenPFOptions("Hardly ever", "Often"),
      scoring: sixteenPFScoring,
    },
    {
      text: "51. I pay more attention to:",
      options: sixteenPFOptions(
        "The practical things around me",
        "Thoughts and imagination"
      ),
      scoring: sixteenPFScoring,
    },
    {
      text: "52. When people criticize me in front of others I feel very downhearted and hurt.",
      options: sixteenPFOptions("Hardly ever", "Often"),
      scoring: sixteenPFScoring,
    },
    {
      text: "53. I find people more interesting if their views are different from most people's.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "54. In dealing with people, it is better to:",
      options: sixteenPFOptions(
        "'Put all your cards on the table'",
        "'Play your hand close to your chest'"
      ),
      scoring: sixteenPFScoring,
    },
    {
      text: "55. I get things done better working alone rather than working with a committee.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "56. I don't usually mind if my room is messy.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "57. Even when someone is slow to understand what I'm explaining, it's easy for me to be patient.",
      options: sixteenPFOptions("True", "False, it's hard to be patient"),
      scoring: sixteenPFScoring,
    },
    {
      text: "58. I'm somewhat of a perfectionist and like to have things done just right.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "59. I enjoy people who show their emotions openly.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "60. I don't let myself get depressed over little things.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "61. In helping with a useful invention, I'd prefer:",
      options: sixteenPFOptions(
        "Working on it in a laboratory",
        "Showing people how to use it"
      ),
      scoring: sixteenPFScoring,
    },
    {
      text: "62. If being polite and pleasant doesn't work, I can be tough and sharp if I need to.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "63. I like to go out to shows or entertainment often.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "64. I feel dissatisfied with myself.",
      options: sixteenPFOptions("Sometimes", "Rarely"),
      scoring: sixteenPFScoring,
    },
    {
      text: "65. People think of me as a happy-go-lucky carefree person.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "66. Teachers, ministers, and others spend too much time trying to stop us from doing what we want to do.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "67. If people are frank and open, others try to get the better of them.",
      options: sixteenPFOptions("Hardly ever", "Often"),
      scoring: sixteenPFScoring,
    },
    {
      text: "68. I'm always interested in mechanical things and am pretty good at fixing them.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "69. Sometimes I get so lost in my thoughts that, unless I watch out, I misplace things, have small mishaps, or lose track of time.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "70. People often say that my ideas are realistic and practical.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "71. I make smart, sarcastic remarks to people if I think they deserve it.",
      options: sixteenPFOptions("Sometimes", "Never"),
      scoring: sixteenPFScoring,
    },
    {
      text: "72. Sometimes I feel as if I've done something wrong, even though I really haven't.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "73. I talk about my feelings:",
      options: sixteenPFOptions(
        "Readily when people seem interested",
        "Only if I can't avoid it"
      ),
      scoring: sixteenPFScoring,
    },
    {
      text: "74. I think about things that I should have said but didn't.",
      options: sixteenPFOptions("Hardly", "Often"),
      scoring: sixteenPFScoring,
    },
    {
      text: "75. I'd rather spend a free evening:",
      options: sixteenPFOptions(
        "Reading or working alone on a project",
        "Working on a task with friends"
      ),
      scoring: sixteenPFScoring,
    },
    {
      text: "76. If there is a chore to do, I'm more likely to:",
      options: sixteenPFOptions(
        "Put it off until it needs to be done",
        "Get started on it right away"
      ),
      scoring: sixteenPFScoring,
    },
    {
      text: "77. I prefer to eat lunch:",
      options: sixteenPFOptions("With a group of people", "By myself"),
      scoring: sixteenPFScoring,
    },
    {
      text: "78. I am patient with people, even when they aren't polite and considerate of my feelings.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "79. When I do something, I usually take time to think of everything I'll need for the job first.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "80. I get frustrated when people take too long to explain something.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "81. I usually go to bed at night feeling satisfied with how my day went.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "82. For a pleasant hobby, I'd prefer:",
      options: sixteenPFOptions(
        "Building or making something",
        "Working with a community service group"
      ),
      scoring: sixteenPFScoring,
    },
    {
      text: "83. I believe in complaining if I receive bad service or poor food in a restaurant.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "84. I have more ups and downs than most people I know.",
      options: sixteenPFOptions("Usually true", "Usually false"),
      scoring: sixteenPFScoring,
    },
    {
      text: "85. When others don't see things my way, I can usually get them to come around.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "86. I think that being free to do what I want is more important than good manners and respect for rules.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "87. I love to make people laugh with witty stories.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "88. If a person is clever enough to get around the rules without seeming to break them, they should:",
      options: sixteenPFOptions(
        "Do it if there is a special reason",
        "Not do it"
      ),
      scoring: sixteenPFScoring,
    },
    {
      text: "89. I'm usually the one who takes the first step in making new friends.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "90. I prefer reading rough and realistic action stories more than sensitive, imaginative novels.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "91. In school I preferred/prefer math more than English.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "92. Many people are too fussy and sensitive and should toughen up for their own good.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "93. If someone asks me a question that is too personal, I carefully try to avoid answering.",
      options: sixteenPFOptions("Usually true", "Usually false"),
      scoring: sixteenPFScoring,
    },
    {
      text: "94. When asked to do volunteer work, I say I'm too busy.",
      options: sixteenPFOptions("Sometimes", "Rarely"),
      scoring: sixteenPFScoring,
    },
    {
      text: "95. More trouble arises from people:",
      options: sixteenPFOptions(
        "Questioning and changing methods that are already satisfactory",
        "Turning down promising, new approaches"
      ),
      scoring: sixteenPFScoring,
    },
    {
      text: "96. I'm very careful when it comes to choosing someone to really 'open up' with.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "97. I most enjoy a meal if it consists of familiar everyday foods rather than new, unusual foods.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "98. I take advantage of people.",
      options: sixteenPFOptions("Sometimes", "Never"),
      scoring: sixteenPFScoring,
    },
    {
      text: "99. I like to plan ahead so that I don't waste time between tasks.",
      options: sixteenPFOptions("Rarely", "Often"),
      scoring: sixteenPFScoring,
    },
    {
      text: "100. When I'm feeling tense, even small things get on my nerves.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "101. In building or making something, I would rather work:",
      options: sixteenPFOptions("With others", "On my own"),
      scoring: sixteenPFScoring,
    },
    {
      text: "102. I enjoy more listening to people talk about their personal feelings than about other things.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "103. There are times when I don't feel in the right mood to see anyone.",
      options: sixteenPFOptions("Very rarely", "Quite often"),
      scoring: sixteenPFScoring,
    },
    {
      text: "104. In a business it would be more interesting to be in charge of:",
      options: sixteenPFOptions(
        "Machinery or keeping records",
        "Talking to and hiring new people"
      ),
      scoring: sixteenPFScoring,
    },
    {
      text: "105. In my everyday life, I hardly ever meet problems that I can't cope with.",
      options: sixteenPFOptions("True, I can cope easily", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "106. If I notice that another person's line of reasoning is wrong, I usually:",
      options: sixteenPFOptions("Point it out", "Let it pass"),
      scoring: sixteenPFScoring,
    },
    {
      text: "107. I greatly enjoy inviting guests over and amusing them.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "108. I enjoy having some competition in the things I do.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "109. Most rules are made to be broken when there are good reasons for it.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "110. I find it hard to speak in front of a large group.",
      options: sixteenPFOptions(
        "True, I usually find it very hard",
        "False, it doesn't bother me"
      ),
      scoring: sixteenPFScoring,
    },
    {
      text: "111. In making a decision, I always think carefully about what's right and proper.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "112. In social groups I tend to feel shy and unsure of myself.",
      options: sixteenPFOptions("True", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "113. Which word does not belong with the other two?",
      options: sixteenPFOptions("Cat", "Near", "Sun"),
      scoring: sixteenPFScoring,
    },
    {
      text: "114. The opposite of right is:",
      options: sixteenPFOptions("Left", "Wrong", "Correct"),
      scoring: sixteenPFScoring,
    },
    {
      text: "115. The opposite of 'inexact' is:",
      options: sixteenPFOptions("Casual", "Accurate", "Rough"),
      scoring: sixteenPFScoring,
    },
    {
      text: "116. Which number should come next at the end of the series: 1, 4, 9, 16?",
      options: sixteenPFOptions("20", "25", "32"),
      scoring: sixteenPFScoring,
    },
    {
      text: "117. Which should come at the end of this row of letters: A, B, D, G?",
      options: sixteenPFOptions("H", "K", "J"),
      scoring: sixteenPFScoring,
    },
    {
      text: "118. Which should come at the end of this row of letters: E, I, L?",
      options: sixteenPFOptions("M", "N", "P"),
      scoring: sixteenPFScoring,
    },
    {
      text: "119. Which should come next at the end of this series of numbers: 1, 2, 0, 3, -1?",
      options: sixteenPFOptions("5", "4", "-3"),
      scoring: sixteenPFScoring,
    },
    {
      text: "120. I get restless and depressed if I don't get some excitement.",
      options: sixteenPFOptions("Often", "Sometimes", "Never"),
      scoring: sixteenPFScoring,
    },
    {
      text: "121. For me, it is important to be:",
      options: sixteenPFOptions(
        "Comfortable, safe, content",
        "In between",
        "Adventurous, risk-taking, thrilled"
      ),
      scoring: sixteenPFScoring,
    },
    {
      text: "122. I feel lonely and miserable.",
      options: sixteenPFOptions("Yes, all the time", "Sometimes", "No, hardly ever"),
      scoring: sixteenPFScoring,
    },
    {
      text: "123. I don't mind if people joke about me and say I'm \"quite a character\".",
      options: sixteenPFOptions("True, I don't mind", "Uncertain", "False, I do mind"),
      scoring: sixteenPFScoring,
    },
    {
      text: "124. I get so fed up with people bothering me that I just don't care whether I answer them or not.",
      options: sixteenPFOptions("Often", "Sometimes", "Never"),
      scoring: sixteenPFScoring,
    },
    {
      text: "125. I wonder if I have the strength to meet life's challenges.",
      options: sixteenPFOptions("Often", "Sometimes", "Rarely"),
      scoring: sixteenPFScoring,
    },
    {
      text: "126. For me, there doesn't seem to be much in life that's really worth doing.",
      options: sixteenPFOptions(
        "True, there's little worth living for",
        "In between",
        "False, I enjoy life"
      ),
      scoring: sixteenPFScoring,
    },
    {
      text: "127. I am confident that I can face and handle most emergencies that come up.",
      options: sixteenPFOptions("True, always", "Perhaps", "False, I do"),
      scoring: sixteenPFScoring,
    },
    {
      text: "128. When I wake up in the morning, I just don't have enough energy to start the day.",
      options: sixteenPFOptions("True, I don't", "Perhaps", "False, I do"),
      scoring: sixteenPFScoring,
    },
    {
      text: "129. I have fears that no one really loves me.",
      options: sixteenPFOptions("Often", "Once in a while", "Not at all"),
      scoring: sixteenPFScoring,
    },
    {
      text: "130. When I've done something well, I've met more friendly encouragement than jealousy or envy.",
      options: sixteenPFOptions("True, I've felt encouraged", "In between", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "131. Criticism easily hurts my feelings and makes me give up.",
      options: sixteenPFOptions("Often", "Sometimes", "Never"),
      scoring: sixteenPFScoring,
    },
    {
      text: "132. At times strange, sudden feelings—like wanting to smash a mirror—seem to take hold of me.",
      options: sixteenPFOptions("True, often", "Only occasionally", "No never"),
      scoring: sixteenPFScoring,
    },
    {
      text: "133. Some simple, unimportant ideas or words run through my mind on and off for days.",
      options: sixteenPFOptions("True", "Uncertain", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "134. Sometimes I feel that my nerves are going to pieces.",
      options: sixteenPFOptions("True", "Uncertain", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "135. I almost never feel sick and disgusted with my life.",
      options: sixteenPFOptions(
        "True, I almost never feel like that",
        "In between",
        "False, I often feel like that"
      ),
      scoring: sixteenPFScoring,
    },
    {
      text: "136. I feel discontented unless I can find some daring thing to do.",
      options: sixteenPFOptions("Yes", "Uncertain", "No"),
      scoring: sixteenPFScoring,
    },
    {
      text: "137. I get a feeling of tension and have a ringing or buzzing in my ears.",
      options: sixteenPFOptions("Yes, often", "Sometimes", "No, almost never"),
      scoring: sixteenPFScoring,
    },
    {
      text: "138. I feel life is so pointless and silly that I no longer even try to tell people how I feel.",
      options: sixteenPFOptions(
        "True, I do feel this way",
        "In between",
        "False, I don't feel this way"
      ),
      scoring: sixteenPFScoring,
    },
    {
      text: "139. People gossip about some of the daring things I do, but I don't mind being the center of attention.",
      options: sixteenPFOptions("True, I don't mind", "In between", "False, I do mind"),
      scoring: sixteenPFScoring,
    },
    {
      text: "140. People seem to be ganged up to treat me as if my opinions didn't matter.",
      options: sixteenPFOptions("Often", "Sometimes", "Never"),
      scoring: sixteenPFScoring,
    },
    {
      text: "141. I keep worrying even about unimportant things if they don't seem quite right.",
      options: sixteenPFOptions("Often", "Sometimes", "Never"),
      scoring: sixteenPFScoring,
    },
    {
      text: "142. There are times when I think I'm no good for anything at all.",
      options: sixteenPFOptions(
        "True, I often think this",
        "In between",
        "False, I almost never do"
      ),
      scoring: sixteenPFScoring,
    },
    {
      text: "143. I can't keep up with daily activities because I don't feel well.",
      options: sixteenPFOptions(
        "True, I can't keep up",
        "In between",
        "False, I can keep up"
      ),
      scoring: sixteenPFScoring,
    },
    {
      text: "144. I think about death, which ends all our problems.",
      options: sixteenPFOptions("A lot", "Sometimes", "Never"),
      scoring: sixteenPFScoring,
    },
    {
      text: "145. I like to be with a group that livens things up with stunts or practical jokes, even when they are a bit risky.",
      options: sixteenPFOptions("Yes, certainly", "Perhaps", "No"),
      scoring: sixteenPFScoring,
    },
    {
      text: "146. I feel self-confident and relaxed.",
      options: sixteenPFOptions("Almost all the time", "Sometimes", "Hardly ever"),
      scoring: sixteenPFScoring,
    },
    {
      text: "147. I don't get dizzy spells or heart flutters if I'm suddenly asked to do something.",
      options: sixteenPFOptions(
        "True, I don't feel like this",
        "Uncertain",
        "False, I do get dizzy spells and heart flutters"
      ),
      scoring: sixteenPFScoring,
    },
    {
      text: "148. I find it easy to keep up cheerful 'small talk' with people.",
      options: sixteenPFOptions("Always", "Sometimes", "Never"),
      scoring: sixteenPFScoring,
    },
    {
      text: "149. A safe rule in life is \"trust nobody.\"",
      options: sixteenPFOptions("Yes, always", "Sometimes", "No, hardly ever"),
      scoring: sixteenPFScoring,
    },
    {
      text: "150. I'm not bothered by other people's disapproval, as long as I'm doing what I enjoy.",
      options: sixteenPFOptions("True", "Uncertain", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "151. I don't have very many fears of hidden physical dangers.",
      options: sixteenPFOptions("True", "Partly true", "False, I am fearful"),
      scoring: sixteenPFScoring,
    },
    {
      text: "152. I have a habit of counting things, such as my steps, or bricks in a wall, for no reason.",
      options: sixteenPFOptions(
        "True, I do this most of the time",
        "Sometimes",
        "False, I very rarely do this"
      ),
      scoring: sixteenPFScoring,
    },
    {
      text: "153. The world seems too complex or too demanding for me.",
      options: sixteenPFOptions("Often", "Sometimes", "Rarely"),
      scoring: sixteenPFScoring,
    },
    {
      text: "154. Every few days my stomach feels upset and uncomfortable.",
      options: sixteenPFOptions("Yes, definitely", "A little", "No, not at all"),
      scoring: sixteenPFScoring,
    },
    {
      text: "155. Lately I don't really care what happens to me.",
      options: sixteenPFOptions("True, all the time", "Sometimes", "False, I don't feel like that"),
      scoring: sixteenPFScoring,
    },
    {
      text: "156. I often feel bored and in a rut so I like to keep trying new things.",
      options: sixteenPFOptions("Yes", "Uncertain", "No"),
      scoring: sixteenPFScoring,
    },
    {
      text: "157. Think about doing normal, everyday things often makes me tense or anxious.",
      options: sixteenPFOptions("True", "Uncertain", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "158. I sleep soundly and wake up full of energy.",
      options: sixteenPFOptions("True, generally", "Only sometimes", "Never, these days"),
      scoring: sixteenPFScoring,
    },
    {
      text: "159. My life has lots of enjoyment and excitement in it.",
      options: sixteenPFOptions("Almost all the time", "Sometimes", "Almost never"),
      scoring: sixteenPFScoring,
    },
    {
      text: "160. I feel that someone may be trying deliberately to harm me.",
      options: sixteenPFOptions("Often", "Sometimes", "Rarely"),
      scoring: sixteenPFScoring,
    },
    {
      text: "161. In dark corners I often think I see people watching me, but when I look carefully they disappear.",
      options: sixteenPFOptions("True, often", "Occasionally", "False, I never do"),
      scoring: sixteenPFScoring,
    },
    {
      text: "162. I don't usually feel a bit lost or anxious when I'm away from home where things are done differently.",
      options: sixteenPFOptions("True, I don't usually", "Uncertain", "False, I often do"),
      scoring: sixteenPFScoring,
    },
    {
      text: "163. I feel weak and ill.",
      options: sixteenPFOptions("Most of the time", "Sometimes", "Practically never"),
      scoring: sixteenPFScoring,
    },
    {
      text: "164. My head stays clear and calm in an emergency.",
      options: sixteenPFOptions("Always", "Sometimes", "Never"),
      scoring: sixteenPFScoring,
    },
    {
      text: "165. I hardly ever have a dark mood or depression come over me for no reason.",
      options: sixteenPFOptions(
        "True, I don't have such moods",
        "Uncertain",
        "False, I do have moods like this"
      ),
      scoring: sixteenPFScoring,
    },
    {
      text: "166. I find it easy to be friendly and playful with young children.",
      options: sixteenPFOptions("Often", "Sometimes", "Rarely"),
      scoring: sixteenPFScoring,
    },
    {
      text: "167. Too many people are trying to interfere with my freedom.",
      options: sixteenPFOptions("True", "Uncertain", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "168. It doesn't bother me when others don't approve of me.",
      options: sixteenPFOptions("True, it doesn't bother me", "Uncertain", "False, it does bother me"),
      scoring: sixteenPFScoring,
    },
    {
      text: "169. Dirty words or embarrassing ideas run through my mind, and I can't get rid of them.",
      options: sixteenPFOptions("Often", "Sometimes", "Almost never"),
      scoring: sixteenPFScoring,
    },
    {
      text: "170. Much of the time I feel sluggish and too weary to move.",
      options: sixteenPFOptions("True", "Partly true", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "171. I like to fill my life with novel, exciting things and would be bored with most ordinary lives.",
      options: sixteenPFOptions("True", "In between", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "172. My zest for each new day is high.",
      options: sixteenPFOptions("Often", "Sometimes", "Rarely"),
      scoring: sixteenPFScoring,
    },
    {
      text: "173. I seem to blame myself for everything that goes wrong, and I'm always critical of myself.",
      options: sixteenPFOptions("True, most times", "True, sometimes", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "174. I'd rather be alone or bored than try to deal with people.",
      options: sixteenPFOptions("Often", "Sometimes", "Rarely"),
      scoring: sixteenPFScoring,
    },
    {
      text: "175. For some reason, it upsets me when other people get public praise.",
      options: sixteenPFOptions("True", "Uncertain", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "176. I sometimes doubt whether I have been much use to anyone in my life.",
      options: sixteenPFOptions("True", "Uncertain", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "177. I feel my health is run down and I should probably see a doctor.",
      options: sixteenPFOptions("True", "Uncertain", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "178. I feel that I'm at the 'end of my rope' and don't want to go on any more.",
      options: sixteenPFOptions("Often", "Sometimes", "Almost never"),
      scoring: sixteenPFScoring,
    },
    {
      text: "179. Often I find it hard to fall asleep because I'm so energized.",
      options: sixteenPFOptions("True", "Uncertain", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "180. My nervous nature too often keeps me from \"branching out\" or enjoying things.",
      options: sixteenPFOptions("True", "Uncertain", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "181. When faced with problems, I don't feel I have enough energy to do something to solve them.",
      options: sixteenPFOptions("True, I don't have the energy", "Sometimes", "False, I do"),
      scoring: sixteenPFScoring,
    },
    {
      text: "182. I have the feeling that I've done something horribly wrong but don't know what.",
      options: sixteenPFOptions("Often", "Sometimes", "Never"),
      scoring: sixteenPFScoring,
    },
    {
      text: "183. People rarely talk about me behind my back.",
      options: sixteenPFOptions("True, they don't", "Uncertain", "False, they often do"),
      scoring: sixteenPFScoring,
    },
    {
      text: "184. I never have moments that are so unreal, it's like I'm not part of what's happening.",
      options: sixteenPFOptions("True, I don't", "Uncertain", "False, sometimes I do"),
      scoring: sixteenPFScoring,
    },
    {
      text: "185. When I'm in a formal place where I'm supposed to be quiet, I'm afraid I may feel like shouting out.",
      options: sixteenPFOptions("Often", "Sometimes", "Rarely"),
      scoring: sixteenPFScoring,
    },
    {
      text: "186. I sometimes think that I am somehow a doomed or condemned person.",
      options: sixteenPFOptions("True", "Perhaps", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "187. When I get up in the morning, I feel I'm ready to face the day's problems.",
      options: sixteenPFOptions("Almost always", "Sometimes", "Hardly ever"),
      scoring: sixteenPFScoring,
    },
    {
      text: "188. It's hard for me to feel truly relaxed and at ease.",
      options: sixteenPFOptions("Almost always", "Sometimes", "Hardly ever"),
      scoring: sixteenPFScoring,
    },
    {
      text: "189. The stresses of everyday life seem to be too much for me.",
      options: sixteenPFOptions("Often", "Sometimes", "Rarely"),
      scoring: sixteenPFScoring,
    },
    {
      text: "190. I have bad dreams in which I am in trouble for something.",
      options: sixteenPFOptions("Often", "Sometimes", "Rarely"),
      scoring: sixteenPFScoring,
    },
    {
      text: "191. I find each day challenging and rewarding.",
      options: sixteenPFOptions("True", "In between", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "192. I am often the only person who understands what is really going on.",
      options: sixteenPFOptions("True", "Uncertain", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "193. Sometimes I feel distant from even my closest friends and family members.",
      options: sixteenPFOptions("True", "Uncertain", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "194. There are things in my daily life that I feel I have to do again and again, no matter how much trouble it takes to get it exactly right.",
      options: sixteenPFOptions(
        "True, I feel like that about many things",
        "In between",
        "False, I don't feel like that"
      ),
      scoring: sixteenPFScoring,
    },
    {
      text: "195. I feel like giving up in the face of life's struggles.",
      options: sixteenPFOptions("Often", "Sometimes", "Rarely"),
      scoring: sixteenPFScoring,
    },
    {
      text: "196. When things go wrong, I find it hard not to give up.",
      options: sixteenPFOptions("True, I often give up", "Uncertain", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "197. If people knew what I really think, they would hate me.",
      options: sixteenPFOptions("True", "Uncertain", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "198. Something new and interesting happens almost every day.",
      options: sixteenPFOptions("True", "Uncertain", "False"),
      scoring: sixteenPFScoring,
    },
    {
      text: "199. I question whether anyone can really understand me.",
      options: sixteenPFOptions("Often", "Sometimes", "Rarely"),
      scoring: sixteenPFScoring,
    },
    {
      text: "200. My emotions are so unreasonable that I don't feel fit to look after myself.",
      options: sixteenPFOptions("Often", "Sometimes", "I never feel like this"),
      scoring: sixteenPFScoring,
    },
  ],
},
};

export default function Assessment({ id }: { id: string }) {
  const currentAssessment = assessmentQuestions[id];
  const questions = currentAssessment.questions;
  const numQuestions = questions.length;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<string[]>(
    Array(numQuestions).fill("")
  ); // Store all answers

  const searchParams = useSearchParams();
  const urlUserId = searchParams.get("userId");
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([]);
  const [currentAssessmentIndex, setCurrentAssessmentIndex] = useState(0);
  const [numAssessments, setNumAssessments] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      if (!urlUserId) return;
      const user = await dataManager.getUserById(urlUserId);
      if (user) {
        setUserId(urlUserId);
        setSelectedAssessments(user.selectedAssessments);
        setNumAssessments(user.selectedAssessments.length);
        setCurrentAssessmentIndex(user.selectedAssessments.indexOf(id));
      }
    };
    load();
  }, [urlUserId, id]);

  const onAnswerChange = (value: string, index: number) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers); // Update the answers array
    if (index + 1 < numQuestions) {
      setTimeout(() => setCurrentQuestion(index + 1), 300);
    }
  };

  const calculateAndSaveScore = async () => {
    if (!userId) throw new Error("No userId");

    let rawScore = 0;
    let subscales: Record<string, number> = {};

    answers.forEach((ans, i) => {
      rawScore += questions[i].scoring[ans] || 0; // Sum all scores, default to 0 for empty
    });
    switch (id) {
      case "assessment-1": // SCARED
        const panicItems = [1, 6, 9, 12, 15, 18, 19, 22, 24, 27, 30, 34, 38]
          .map((j) =>
            answers[j - 1] ? questions[j - 1].scoring[answers[j - 1]] : 0
          )
          .reduce((a, b) => a + b, 0);
        const generalItems = [5, 7, 14, 21, 23, 28, 33, 35, 37]
          .map((j) =>
            answers[j - 1] ? questions[j - 1].scoring[answers[j - 1]] : 0
          )
          .reduce((a, b) => a + b, 0);
        const separationItems = [4, 8, 13, 16, 20, 25, 29, 31]
          .map((j) =>
            answers[j - 1] ? questions[j - 1].scoring[answers[j - 1]] : 0
          )
          .reduce((a, b) => a + b, 0);
        const socialItems = [3, 10, 26, 32, 39, 40, 41]
          .map((j) =>
            answers[j - 1] ? questions[j - 1].scoring[answers[j - 1]] : 0
          )
          .reduce((a, b) => a + b, 0);
        const schoolItems = [2, 11, 17, 36]
          .map((j) =>
            answers[j - 1] ? questions[j - 1].scoring[answers[j - 1]] : 0
          )
          .reduce((a, b) => a + b, 0);
        subscales = {
          panic: panicItems,
          general: generalItems,
          separation: separationItems,
          social: socialItems,
          school: schoolItems,
        };
        break;
      case "assessment-2": // Work-Life: No subscales, raw sum.
        break;
      case "assessment-3": // HAM-A: No subscales, raw sum.
        break;
      case "assessment-4": // HDRS: No subscales, raw sum.
        break;
      case "assessment-5": // CBCL
        const anxiousDepressed = [
          14, 29, 30, 31, 32, 33, 35, 45, 50, 52, 71, 91, 112,
        ]
          .map((j) =>
            answers[j - 1] ? questions[j - 1].scoring[answers[j - 1]] : 0
          )
          .reduce((a, b) => a + b, 0);
        const withdrawnDepressed = [5, 42, 65, 69, 75, 100, 102, 103, 111]
          .map((j) =>
            answers[j - 1] ? questions[j - 1].scoring[answers[j - 1]] : 0
          )
          .reduce((a, b) => a + b, 0);
        const somaticComplaints = [
          47, 49, 51, 54, 56, 56, 56, 56, 56, 56, 56, 56,
        ]
          .map((j) =>
            answers[j - 1] ? questions[j - 1].scoring[answers[j - 1]] : 0
          )
          .reduce((a, b) => a + b, 0); // Approx for 56a-h as 56 repeated, but adjust if separate questions.
        const socialProblems = [1, 11, 12, 25, 27, 34, 36, 38, 48, 62, 64]
          .map((j) =>
            answers[j - 1] ? questions[j - 1].scoring[answers[j - 1]] : 0
          )
          .reduce((a, b) => a + b, 0);
        const thoughtProblems = [
          9, 18, 40, 46, 58, 59, 66, 70, 76, 83, 84, 85, 92, 100,
        ]
          .map((j) =>
            answers[j - 1] ? questions[j - 1].scoring[answers[j - 1]] : 0
          )
          .reduce((a, b) => a + b, 0);
        const attentionProblems = [1, 4, 8, 10, 13, 17, 41, 61, 78, 80]
          .map((j) =>
            answers[j - 1] ? questions[j - 1].scoring[answers[j - 1]] : 0
          )
          .reduce((a, b) => a + b, 0);
        const ruleBreaking = [
          2, 26, 28, 39, 43, 63, 67, 72, 73, 81, 82, 90, 96, 99, 101, 105, 106,
        ]
          .map((j) =>
            answers[j - 1] ? questions[j - 1].scoring[answers[j - 1]] : 0
          )
          .reduce((a, b) => a + b, 0);
        const aggressive = [
          3, 16, 19, 20, 21, 22, 23, 37, 57, 68, 86, 87, 89, 94, 95, 97, 104,
        ]
          .map((j) =>
            answers[j - 1] ? questions[j - 1].scoring[answers[j - 1]] : 0
          )
          .reduce((a, b) => a + b, 0);
        subscales = {
          anxiousDepressed,
          withdrawnDepressed,
          somaticComplaints,
          socialProblems,
          thoughtProblems,
          attentionProblems,
          ruleBreaking,
          aggressive,
        };
        break;
      case "assessment-6": // IAT: No subscales, raw sum.
        break;
      case "assessment-7": // LSAS
        let fearSum = 0,
          avoidanceSum = 0;
        for (let i = 0; i < 24; i++) {
          fearSum += questions[i * 2].scoring[answers[i * 2]] || 0;
          avoidanceSum += questions[i * 2 + 1].scoring[answers[i * 2 + 1]] || 0;
        }
        rawScore = fearSum + avoidanceSum;
        subscales = { fear: fearSum, avoidance: avoidanceSum };
        break;
      case "assessment-8": // 16PF: Raw sum, Sten
        const sten = Math.round(((rawScore - 99.5) / 40) * 2 + 5.5);
        subscales = { sten }; // Simplified
        break;
    }

    const score: AssessmentScore = {
      id,
      rawScore,
      subscales,
      date: new Date().toISOString(),
    };

    await dataManager.updateUserScores(userId, id, score);
    return score;
  };

  const handleComplete = async () => {
    if (!answers[currentQuestion] || !userId) return;

    setIsSubmitting(true);
    try {
      await calculateAndSaveScore();
      const nextIndex = currentAssessmentIndex + 1;

      if (nextIndex < numAssessments) {
        router.push(
          `/assessment/${selectedAssessments[nextIndex]}?userId=${userId}`
        );
      } else {
        router.push(`/summary?userId=${userId}`);
      }
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save score. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="max-w-4xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-800">
            {currentAssessment.name}
          </CardTitle>
          <Progress
            value={Math.round(
              ((currentQuestion + 1) / Math.max(1, numQuestions)) * 100
            )}
            className="w-full h-3 mt-4"
          />
          <p className="text-lg mt-2">
            Question {currentQuestion + 1} of {numQuestions}
          </p>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="text-xl font-semibold text-gray-800 mb-6 text-center">
              {questions[currentQuestion].text}
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              {questions[currentQuestion].options.map((opt) => (
                <div
                  key={opt.value}
                  className={`
                    p-4 rounded-lg cursor-pointer border-2 transition-all flex-1 min-w-[150px] max-w-[200px] text-center
                    ${opt.color} 
                    ${
                      answers[currentQuestion] === opt.value
                        ? "ring-4 ring-blue-500 scale-105 shadow-lg"
                        : ""
                    }
                  `}
                  onClick={() => onAnswerChange(opt.value, currentQuestion)}
                >
                  <div className="cursor-pointer block text-sm font-medium">
                    {opt.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {currentQuestion === numQuestions - 1 &&
            answers[currentQuestion] &&
            !isSubmitting && (
              <div className="text-center space-y-4 mt-8">
                <Button
                  onClick={handleComplete}
                  size="lg"
                  className="w-full bg-green-600 text-white text-xl py-6 hover:bg-green-700"
                >
                  ✅ Complete Assessment & View Results
                </Button>
              </div>
            )}

          {currentQuestion < numQuestions - 1 && (
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                onClick={() =>
                  setCurrentQuestion(Math.max(0, currentQuestion - 1))
                }
                disabled={currentQuestion === 0}
              >
                ← Previous
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (answers[currentQuestion]) {
                    setCurrentQuestion(
                      Math.min(numQuestions - 1, currentQuestion + 1)
                    );
                  }
                }}
                disabled={!answers[currentQuestion]}
              >
                Next →
              </Button>
            </div>
          )}

          {isSubmitting && (
            <div className="text-center mt-8 p-4 bg-blue-50 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg font-medium text-blue-800">
                Saving & Redirecting...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
