import type { OnboardingAnswers } from "@/lib/user-profile-store";

export function buildCoachMessages(answers?: OnboardingAnswers) {
  if (!answers) {
    return [
      {
        role: "coach",
        text: "You said you want to grow into remote product design work. Let us focus on one visible proof of skill this week.",
      },
      {
        role: "user",
        text: "I have been learning, but I am not sure what to finish first.",
      },
      {
        role: "coach",
        text: "Finish a small landing page case study, publish it, and use it as your anchor piece for applications.",
      },
    ];
  }

  return [
    {
      role: "coach",
      text: `You want to ${answers.goal.toLowerCase()} and your strongest current lever is ${answers.skills.toLowerCase()}. Let us make that concrete this week.`,
    },
    {
      role: "user",
      text: `I can commit ${answers.time.toLowerCase()} and I am most interested in ${answers.interest.toLowerCase()}.`,
    },
    {
      role: "coach",
      text: `Good. Build one visible output that fits a ${answers.budget.toLowerCase()} budget and points directly toward ${answers.interest.toLowerCase()}.`,
    },
  ];
}

export function buildActionAdvice(answers?: OnboardingAnswers) {
  if (!answers) {
    return [
      "Refine one portfolio project before 6 PM today.",
      "Write a short case study summary with your process and result.",
      "Send the finished work to two target opportunities this week.",
    ];
  }

  return [
    `Create one concrete asset that supports your goal to ${answers.goal.toLowerCase()}.`,
    `Use your ${answers.time.toLowerCase()} this week to improve ${answers.skills.toLowerCase()}.`,
    `Send that output toward one ${answers.interest.toLowerCase()} opportunity that fits a ${answers.budget.toLowerCase()} budget.`,
  ];
}

export function buildWeeklyTasks(answers?: OnboardingAnswers) {
  if (!answers) {
    return [
      "Publish one polished portfolio project",
      "Apply to 3 relevant opportunities",
      "Complete one focused skill session",
      "Share your work publicly once this week",
    ];
  }

  return [
    `Take one visible step toward: ${answers.goal}.`,
    `Practice ${answers.skills.toLowerCase()} during your ${answers.time.toLowerCase()} commitment window.`,
    `Research and shortlist one ${answers.interest.toLowerCase()} option.`,
    `Use only tools that fit your current ${answers.budget.toLowerCase()} budget.`,
  ];
}

export function buildCompletedTasks(answers?: OnboardingAnswers) {
  if (!answers) {
    return [
      "Updated your profile summary",
      "Reviewed last week's coach notes",
    ];
  }

  return [
    `Saved your main goal: ${answers.goal}.`,
    `Defined your primary skill focus: ${answers.skills}.`,
  ];
}

export function buildMissedTasks(answers?: OnboardingAnswers) {
  if (!answers) {
    return [
      "You missed one application target last week.",
      "A scheduled practice session was not completed.",
    ];
  }

  return [
    `If you skip your ${answers.time.toLowerCase()} block, progress toward ${answers.goal.toLowerCase()} slows quickly.`,
    `Avoid spending beyond your ${answers.budget.toLowerCase()} budget on the wrong tools or courses.`,
  ];
}

export function buildProgressMetrics(answers?: OnboardingAnswers) {
  if (!answers) {
    return [
      { label: "Progress score", value: "82", note: "Strong momentum this week" },
      { label: "Completed missions", value: "18", note: "Across recent cycles" },
      { label: "Consistency streak", value: "12 days", note: "Keep the rhythm going" },
      { label: "Goal/action match", value: "84%", note: "Your work matches your direction" },
    ];
  }

  return [
    { label: "Progress score", value: "86", note: `Aligned with ${answers.goal.toLowerCase()}` },
    { label: "Completed missions", value: "4", note: `Focused around ${answers.skills.toLowerCase()}` },
    { label: "Consistency streak", value: answers.time, note: "Based on your current availability" },
    { label: "Goal/action match", value: "90%", note: `Strong fit with ${answers.interest.toLowerCase()}` },
  ];
}

export function buildProgressEncouragement(answers?: OnboardingAnswers) {
  if (!answers) {
    return {
      title: "You are progressing well, but consistency is still your biggest edge.",
      body: "DSIQ recommends protecting your weekly mission blocks. Small missed sessions can quickly reduce long-term momentum.",
    };
  }

  return {
    title: `Your path looks strongest when ${answers.skills.toLowerCase()} stays tied to ${answers.goal.toLowerCase()}.`,
    body: `Protect your ${answers.time.toLowerCase()} each week and keep choosing ${answers.interest.toLowerCase()} opportunities that match your ${answers.budget.toLowerCase()} budget.`,
  };
}

export function buildOpportunityGroups(answers?: OnboardingAnswers) {
  if (!answers) {
    return [
      {
        title: "Freelance ideas",
        items: [
          "Landing page design for local brands",
          "Portfolio website builds for creatives",
          "Social media design retainers for startups",
        ],
      },
      {
        title: "Business ideas",
        items: [
          "Micro design studio for founder MVPs",
          "Career portfolio review service for students",
          "Template packs for small business launches",
        ],
      },
      {
        title: "Learning paths",
        items: [
          "Product design fundamentals to case study publishing",
          "Frontend portfolio path for remote-ready work",
          "Personal brand writing for opportunity visibility",
        ],
      },
      {
        title: "Scholarships",
        items: [
          "Creative technology fellowship applications",
          "Design accelerator scholarship opportunities",
          "Youth innovation support programs",
        ],
      },
      {
        title: "Remote jobs",
        items: [
          "Junior UI designer roles at early-stage startups",
          "Remote product support with growth exposure",
          "Contract frontend roles for small global teams",
        ],
      },
      {
        title: "Hackathons",
        items: [
          "Design sprint challenges for founders",
          "Tech community product-building weekends",
          "Innovation competitions with mentorship access",
        ],
      },
    ];
  }

  return [
    {
      title: "Freelance ideas",
      items: [
        `${answers.skills} gigs that move you toward ${answers.goal.toLowerCase()}`,
        `${answers.interest} offers that fit a ${answers.budget.toLowerCase()} budget`,
        `Short client work scoped to your ${answers.time.toLowerCase()} availability`,
      ],
    },
    {
      title: "Business ideas",
      items: [
        `${answers.skills} micro-service offers for local clients`,
        `A lean service around ${answers.interest.toLowerCase()} discovery`,
        `A low-cost offer you can test within your ${answers.budget.toLowerCase()} budget`,
      ],
    },
    {
      title: "Learning paths",
      items: [
        `${answers.skills} roadmap designed for ${answers.time.toLowerCase()}`,
        `Practical learning tied directly to ${answers.goal.toLowerCase()}`,
        `Skill-building with tools that fit a ${answers.budget.toLowerCase()} budget`,
      ],
    },
    {
      title: "Scholarships",
      items: [
        `${answers.interest} programs with strong growth upside`,
        `Support opportunities linked to ${answers.goal.toLowerCase()}`,
        `Learning grants that reduce pressure on your ${answers.budget.toLowerCase()} budget`,
      ],
    },
    {
      title: "Remote jobs",
      items: [
        `${answers.skills} roles aligned with ${answers.goal.toLowerCase()}`,
        `Entry paths that match your ${answers.time.toLowerCase()} commitment`,
        `${answers.interest} roles with real portfolio value`,
      ],
    },
    {
      title: "Hackathons",
      items: [
        `${answers.skills} sprints that create visible proof of work`,
        `${answers.interest} events that open doors to new networks`,
        `Challenges you can join without exceeding your ${answers.budget.toLowerCase()} budget`,
      ],
    },
  ];
}
