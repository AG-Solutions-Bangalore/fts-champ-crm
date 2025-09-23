@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Default Blue Theme */
    --background: 210 100% 98%;          /* light blue background */
    --foreground: 213 94% 20%;           /* dark blue text */
    --card: 255 100% 100%;                /* white-ish card */
    --card-foreground: 213 94% 20%;       /* text on card */
    --popover: 255 100% 100%;             /* popover background */
    --popover-foreground: 213 94% 20%;    /* popover text */
    --primary: 213 94% 68%;               /* blue buttons / highlights */
    --primary-foreground: 0 0% 100%;      /* white text on primary */
    --secondary: 210 40% 95%;             /* secondary elements bg */
    --secondary-foreground: 213 94% 20%;  /* secondary text */
    --muted: 210 40% 96%;                 /* muted bg */
    --muted-foreground: 215 20% 60%;      /* muted text */
    --accent: 213 94% 68%;                /* accent color */
    --accent-foreground: 0 0% 100%;       /* accent text */
    --destructive: 0 80% 60%;             /* destructive button */
    --destructive-foreground: 255 255% 255%; /* white text */
    --border: 210 50% 85%;                /* border blue */
    --input: 210 50% 85%;                 /* input bg */
    --ring: 213 94% 68%;                  /* focus ring */
    --chart-1: 210 100% 50%;
    --chart-2: 200 90% 50%;
    --chart-3: 220 80% 50%;
    --chart-4: 190 70% 50%;
    --chart-5: 230 60% 50%;
    --radius: 0.5rem;
  
    /* Sidebar */
    --sidebar-background: 210 100% 98%;
    --sidebar-foreground: 213 94% 20%;
    --sidebar-primary: 213 94% 68%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 210 50% 95%;
    --sidebar-accent-foreground: 213 94% 20%;
    --sidebar-border: 210 50% 85%;
    --sidebar-ring: 213 94% 68%;
  
    --team-color: #3b82f6;               /* brand blue */
    --color-light: hsl(210, 100%, 96%);  /* bg-blue-100 */
    --color: hsl(213, 94%, 68%);         /* text-blue-600 */
    --color-dark: hsl(215, 28%, 17%);    /* dark:bg-blue-900 */
    --colordark-text: hsl(213, 94%, 82%); /* dark:text-blue-200 */
    --color-border: hsl(210, 100%, 90%); /* border-blue-200 */
    --color-border-dark: hsl(215, 28%, 25%); /* dark:border-blue-800 */
  }
  

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
    --radius: 0.5rem;
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224.3 76.3% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }

  /* === Yellow Theme === */
  .theme-yellow {
    --background: 60 100% 98%;
    --foreground: 45 90% 10%;
    --card: 60 100% 100%;
    --card-foreground: 45 90% 10%;
    --popover: 60 100% 100%;
    --popover-foreground: 45 90% 10%;
    --primary: 45 100% 50%;
    --primary-foreground: 0 0% 100%;
    --secondary: 55 90% 90%;
    --secondary-foreground: 45 90% 10%;
    --muted: 55 90% 92%;
    --muted-foreground: 45 30% 40%;
    --accent: 50 95% 70%;
    --accent-foreground: 45 90% 10%;
    --destructive: 10 80% 55%;
    --destructive-foreground: 0 0% 100%;
    --border: 55 70% 80%;
    --input: 55 70% 80%;
    --ring: 45 100% 40%;
    --chart-1: 45 100% 50%;
    --chart-2: 30 90% 55%;
    --chart-3: 50 95% 60%;
    --chart-4: 60 80% 65%;
    --chart-5: 35 95% 50%;
    --team-color: #eab308;
    --radius: 0.5rem;
    --sidebar-background: 55 90% 96%;
    --sidebar-foreground: 45 80% 15%;
    --sidebar-primary: 45 100% 40%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 55 90% 85%;
    --sidebar-accent-foreground: 45 80% 15%;
    --sidebar-border: 55 70% 80%;
    --sidebar-ring: 45 100% 40%;
    --color-light: hsl(50, 100%, 90%);  /* bg-yellow-100 */
    --color: hsl(45, 93%, 47%);         /* text-yellow-600 */
    --color-dark: hsl(45, 28%, 17%);    /* dark:bg-yellow-900 */
    --color-dark-text: hsl(45, 90%, 80%); /* dark:text-yellow-200 */
    --color-border: hsl(50, 100%, 85%);    /* border-yellow-200 */
    --color-border-dark: hsl(45, 28%, 25%); /* dark:border-yellow-800 */
  }

  /* === Green Theme === */
  .theme-green {
    --background: 120 50% 98%;
    --foreground: 120 40% 10%;
    --card: 120 50% 100%;
    --card-foreground: 120 40% 10%;
    --popover: 120 50% 100%;
    --popover-foreground: 120 40% 10%;
    --primary: 145 60% 40%;
    --primary-foreground: 0 0% 100%;
    --secondary: 140 40% 85%;
    --secondary-foreground: 120 40% 10%;
    --muted: 135 40% 92%;
    --muted-foreground: 125 25% 40%;
    --accent: 150 60% 70%;
    --accent-foreground: 120 40% 10%;
    --destructive: 0 70% 45%;
    --destructive-foreground: 0 0% 100%;
    --team-color: #22c55e; 
    --border: 140 40% 75%;
    --input: 140 40% 75%;
    --ring: 145 60% 40%;
    --chart-1: 145 60% 40%;
    --chart-2: 160 50% 50%;
    --chart-3: 120 50% 35%;
    --chart-4: 150 60% 45%;
    --chart-5: 130 55% 50%;
    --radius: 0.5rem;
    --sidebar-background: 140 40% 96%;
    --sidebar-foreground: 120 35% 15%;
    --sidebar-primary: 145 60% 40%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 140 35% 85%;
    --sidebar-accent-foreground: 120 35% 15%;
    --sidebar-border: 140 40% 75%;
    --sidebar-ring: 145 60% 40%;
    --color-light: hsl(142, 77%, 93%); /* bg-green-100 */
    --color: hsl(142, 72%, 29%);       /* text-green-600 */
    --color-dark: hsl(142, 28%, 15%);  /* dark:bg-green-900 */
    --color-dark-text: hsl(142, 70%, 80%); /* dark:text-green-200 */
    --color-border: hsl(142, 77%, 85%);    /* border-green-200 */
    --color-border-dark: hsl(142, 28%, 25%); /* dark:border-green-800 */
  
  }
  /* === Purple Theme === */
.theme-purple {
  --background: 270 50% 98%;
  --foreground: 270 40% 10%;
  --card: 270 50% 100%;
  --card-foreground: 270 40% 10%;
  --popover: 270 50% 100%;
  --popover-foreground: 270 40% 10%;
  --primary: 260 60% 50%;
  --primary-foreground: 0 0% 100%;
  --secondary: 270 40% 85%;
  --secondary-foreground: 270 40% 10%;
  --muted: 265 40% 92%;
  --muted-foreground: 260 25% 40%;
  --accent: 275 60% 70%;
  --accent-foreground: 270 40% 10%;
  --destructive: 0 70% 45%;
  --destructive-foreground: 0 0% 100%;
  --team-color: #8b5cf6; 
  --border: 270 40% 75%;
  --input: 270 40% 75%;
  --ring: 260 60% 50%;
  --chart-1: 260 60% 50%;
  --chart-2: 270 50% 50%;
  --chart-3: 280 50% 35%;
  --chart-4: 275 60% 45%;
  --chart-5: 290 55% 50%;
  --radius: 0.5rem;
  --sidebar-background: 270 40% 96%;
  --sidebar-foreground: 270 35% 15%;
  --sidebar-primary: 260 60% 50%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 270 35% 85%;
  --sidebar-accent-foreground: 270 35% 15%;
  --sidebar-border: 270 40% 75%;
  --sidebar-ring: 260 60% 50%;
  --color-light: hsl(270, 77%, 93%);
  --color: hsl(270, 72%, 29%);
  --color-dark: hsl(270, 28%, 15%);
  --color-dark-text: hsl(270, 70%, 80%);
  --color-border: hsl(270, 77%, 85%);
  --color-border-dark: hsl(270, 28%, 25%);
}

/* === Teal Theme === */
.theme-teal {
  --background: 180 50% 98%;
  --foreground: 180 40% 10%;
  --card: 180 50% 100%;
  --card-foreground: 180 40% 10%;
  --popover: 180 50% 100%;
  --popover-foreground: 180 40% 10%;
  --primary: 175 60% 45%;
  --primary-foreground: 0 0% 100%;
  --secondary: 180 40% 85%;
  --secondary-foreground: 180 40% 10%;
  --muted: 175 40% 92%;
  --muted-foreground: 170 25% 40%;
  --accent: 180 60% 70%;
  --accent-foreground: 180 40% 10%;
  --destructive: 0 70% 45%;
  --destructive-foreground: 0 0% 100%;
  --team-color: #14b8a6; 
  --border: 180 40% 75%;
  --input: 180 40% 75%;
  --ring: 175 60% 45%;
  --chart-1: 175 60% 45%;
  --chart-2: 180 50% 50%;
  --chart-3: 185 50% 35%;
  --chart-4: 180 60% 45%;
  --chart-5: 170 55% 50%;
  --radius: 0.5rem;
  --sidebar-background: 180 40% 96%;
  --sidebar-foreground: 180 35% 15%;
  --sidebar-primary: 175 60% 45%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 180 35% 85%;
  --sidebar-accent-foreground: 180 35% 15%;
  --sidebar-border: 180 40% 75%;
  --sidebar-ring: 175 60% 45%;
  --color-light: hsl(180, 77%, 93%);
  --color: hsl(180, 72%, 29%);
  --color-dark: hsl(180, 28%, 15%);
  --color-dark-text: hsl(180, 70%, 80%);
  --color-border: hsl(180, 77%, 85%);
  --color-border-dark: hsl(180, 28%, 25%);
}

/* === Gray Theme === */
.theme-gray {
  --background: 0 0% 98%;
  --foreground: 210 10% 20%;
  --card: 0 0% 100%;
  --card-foreground: 210 10% 20%;
  --popover: 0 0% 100%;
  --popover-foreground: 210 10% 20%;
  --primary: 210 10% 60%;
  --primary-foreground: 0 0% 100%;
  --secondary: 0 0% 90%;
  --secondary-foreground: 210 10% 20%;
  --muted: 0 0% 95%;
  --muted-foreground: 215 20% 60%;
  --accent: 210 10% 60%;
  --accent-foreground: 0 0% 100%;
  --destructive: 0 80% 60%;
  --destructive-foreground: 255 255% 255%;
  --team-color: #9ca3af;
  --border: 0 0% 85%;
  --input: 0 0% 85%;
  --ring: 210 10% 60%;
  --chart-1: 210 100% 50%;
  --chart-2: 200 90% 50%;
  --chart-3: 220 80% 50%;
  --chart-4: 190 70% 50%;
  --chart-5: 230 60% 50%;
  --radius: 0.5rem;
  --sidebar-background: 0 0% 96%;
  --sidebar-foreground: 210 10% 20%;
  --sidebar-primary: 210 10% 60%;
  --sidebar-primary-foreground: 0 0% 100%;
  --sidebar-accent: 0 0% 85%;
  --sidebar-accent-foreground: 210 10% 20%;
  --sidebar-border: 0 0% 85%;
  --sidebar-ring: 210 10% 60%;
  --color-light: hsl(0, 0%, 95%);
  --color: hsl(210, 10%, 40%);
  --color-dark: hsl(210, 10%, 20%);
  --color-dark-text: hsl(210, 10%, 60%);
  --color-border: hsl(0, 0%, 85%);
  --color-border-dark: hsl(210, 10%, 25%);
}

}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-family: 'Noto Sans Georgian', sans-serif;
  }
}

/* Firefox scrollbar */
* {
  scrollbar-width: thin;
  scrollbar-color: #fafafa #ffffff;
}
