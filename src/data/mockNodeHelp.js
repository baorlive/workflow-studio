
/**
 * Mock data for guided node help
 * Tailored for non-technical users with plain, everyday language.
 */

export const NODE_HELP_CONTENT = {
    trigger: {
        simpleName: "The Starter",
        description: "This is the 'Go' button for your workflow. It waits for something specific to happen—like a new email arriving or a scheduled time—and then kicks off all the other steps.",
        visualIcon: "zap",
        color: "text-yellow-500",
        examples: [
            "Start every morning at 9 AM",
            "Start when a customer fills out a form",
            "Start when a file is uploaded"
        ],
        qa: [
            {
                question: "What does this node do?",
                answer: "It watches for a specific event and tells the rest of your workflow to start running when that event happens."
            },
            {
                question: "How do I connect two nodes?",
                answer: "Simply click the small dot on the right side of this node and drag a line to the dot on the left side of the next node. It's like plugging in a cord!"
            },
            {
                question: "Why isn't it working?",
                answer: "Check if you've set the right 'event' to listen for. For example, if you set it to 'New Email', it won't run until an email actually arrives."
            }
        ]
    },
    action: {
        simpleName: "The Doer",
        description: "This node actually *does* something. It sends emails, updates records, or posts messages. It's the worker bee of your workflow.",
        visualIcon: "activity",
        color: "text-blue-500",
        examples: [
            "Send a welcome email",
            "Create a new spreadsheet row",
            "Post a Slack message"
        ],
        qa: [
            {
                question: "What does this node do?",
                answer: "It performs a specific task, like sending a message or saving data, based on the information it receives from previous steps."
            },
            {
                question: "Can it do multiple things?",
                answer: "One Action node usually does one specific thing. If you want to do three things (like send an email, update a database, AND notify a team), just chain three Action nodes together!"
            }
        ]
    },
    conditional: {
        simpleName: "The Decider",
        description: "This is a fork in the road. It asks a Yes/No question about your data and sends the workflow down different paths depending on the answer.",
        visualIcon: "gitBranch",
        color: "text-purple-500",
        examples: [
            "Is the email from a VIP client?",
            "Is the order total over $100?",
            "Is today a weekend?"
        ],
        qa: [
            {
                question: "What does this node do?",
                answer: "It acts like a traffic cop. It looks at your data, checks a rule you set (like 'Is price > $50?'), and directs the flow either to the 'Yes' path or the 'No' path."
            },
            {
                question: "How do I use the two paths?",
                answer: "Connect the 'True' (or Yes) output to the steps you want to happen when the rule is met. Connect 'False' (or No) to steps for when it isn't."
            }
        ]
    },
    compute: {
        simpleName: "The Processor",
        description: "This node scores, classifies, or reshapes incoming data so the next step can make a clean decision.",
        visualIcon: "brain",
        color: "text-pink-500",
        examples: [
            "Score incoming tickets by urgency",
            "Classify reviews into positive or negative groups",
            "Prepare a clean output for the next step"
        ],
        qa: [
            {
                question: "What does this node do?",
                answer: "It processes incoming data and turns it into something easier to route, score, or act on."
            },
            {
                question: "Is it always right?",
                answer: "It follows the data and rules you provide, so the quality of the result depends on how well those inputs are set up."
            }
        ]
    },
    data: {
        simpleName: "The Filing Cabinet",
        description: "This node is for retrieving or storing information. Think of it as opening a drawer to get a file or putting a file away for safekeeping.",
        visualIcon: "database",
        color: "text-green-500",
        examples: [
            "Get customer details",
            "Save a new order",
            "Look up product inventory"
        ],
        qa: [
            {
                question: "What does this node do?",
                answer: "It talks to your database. It can either fetch information you need or save new information you've created."
            }
        ]
    },
    transform: {
        simpleName: "The Translator",
        description: "This node changes data from one format to another. Like translating English to French, or turning a list of names into a formatted table.",
        visualIcon: "refreshCw",
        color: "text-indigo-500",
        examples: [
            "Convert currency (USD to EUR)",
            "Format a date (2023-01-01 to Jan 1st)",
            "Clean up messy text"
        ],
        qa: [
            {
                question: "What does this node do?",
                answer: "It reshapes your data. It takes information in one layout and rearranges or modifies it to fit what the next node needs."
            }
        ]
    },
    delay: {
        simpleName: "The Timer",
        description: "This node tells the workflow to pause and wait for a set amount of time before continuing.",
        visualIcon: "clock",
        color: "text-gray-500",
        examples: [
            "Wait 2 days before sending follow-up",
            "Pause for 1 hour",
            "Wait until Monday morning"
        ],
        qa: [
            {
                question: "What does this node do?",
                answer: "It hits the 'Pause' button on your workflow. Everything stops here for as long as you specify, then automatically resumes."
            }
        ]
    },
    merge: {
        simpleName: "The Funnel",
        description: "This node brings multiple paths back together into a single flow.",
        visualIcon: "gitMerge",
        color: "text-orange-500",
        examples: [
            "Combine 'Yes' and 'No' paths after an action",
            "Bring parallel tasks back together"
        ],
        qa: [
            {
                question: "What does this node do?",
                answer: "It acts like a funnel. If your workflow split into different directions earlier, this node lets you join them back into one main path."
            }
        ]
    },
    exception: {
        simpleName: "The Safety Net",
        description: "This node catches errors. If something goes wrong in your workflow, this node steps in to handle it gracefully.",
        visualIcon: "shieldAlert",
        color: "text-red-500",
        examples: [
            "Send an alert if an API fails",
            "Retry a step if it gets stuck",
            "Log an error message"
        ],
        qa: [
            {
                question: "What does this node do?",
                answer: "It's your backup plan. It watches for problems and runs a specific set of instructions if an error occurs, so your whole workflow doesn't crash."
            }
        ]
    },
    decision: {
        simpleName: "The Evaluator",
        description: "Similar to 'The Decider', but can handle complex rules or multiple choices.",
        visualIcon: "gitPullRequest",
        color: "text-purple-600",
        examples: [
            "Route based on region (North, South, East, West)",
            "Categorize support tickets"
        ],
        qa: [
            {
                question: "What does this node do?",
                answer: "It evaluates your data against multiple rules and sends it down the matching path. It's like a sorting machine."
            }
        ]
    },
    default: {
        simpleName: "Workflow Step",
        description: "A building block of your automated process.",
        visualIcon: "box",
        color: "text-gray-400",
        examples: ["Process data", "Move information", "Trigger events"],
        qa: [
            {
                question: "What does this node do?",
                answer: "This is a general step in your workflow. It helps move your process from start to finish."
            }
        ]
    }
};

export const COMMON_QUESTIONS = [
    "What does this node do?",
    "How do I connect two nodes?",
    "Why isn't it working?",
    "Can I undo a mistake?",
    "How do I save my changes?"
];

export const GENERAL_ANSWERS = {
    "how do i connect two nodes?": "Simply click the small dot (port) on the right side of a node and drag a line to the dot on the left side of another node. Release to connect them!",
    "can i undo a mistake?": "Yes! You can usually press Ctrl+Z (or Cmd+Z on Mac) to undo your last action.",
    "how do i save my changes?": "The workflow usually saves automatically, but you can look for a 'Save' button in the top toolbar just to be safe."
};
