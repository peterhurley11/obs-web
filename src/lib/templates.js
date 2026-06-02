// src/lib/templates.js

export const TEMPLATES = [
  {
    id: 'whos-next-lower-third',
    label: "Who's Next",
    component: 'WhosNextLowerThird',
    fieldLabels: {
      name: 'Line 1',
      title: 'Line 2',
      color: 'Color'
    },
    defaultFields: {
      name: 'PLAYER NAME',
      title: 'TEAM · POSITION',
      color: '#ffffff'
    },
    defaultAnimation: {
      in: 'slide-up',
      out: 'slide-down',
      durationMs: 350
    }
  },
  {
    id: 'lower-third',
    label: 'Lower Third',
    component: 'LowerThird',
    defaultFields: {
      name: 'Guest Name',
      title: 'Role / Title'
    },
    defaultAnimation: {
      in: 'slide-up',
      out: 'slide-down',
      durationMs: 400
    }
  },
  {
    id: 'scoreboard',
    label: 'Scoreboard',
    component: 'ScoreBoard',
    defaultFields: {
      teamA: 'HOME',
      teamB: 'AWAY',
      scoreA: '0',
      scoreB: '0',
      period: 'Q1'
    },
    defaultAnimation: {
      in: 'fade',
      out: 'fade',
      durationMs: 300
    }
  },
  {
    id: 'fullscreen-title',
    label: 'Full Screen Title',
    component: 'FullscreenTitle',
    defaultFields: {
      headline: 'BREAKING',
      subtext: 'Supporting detail here'
    },
    defaultAnimation: {
      in: 'fade',
      out: 'fade',
      durationMs: 500
    }
  }
]

export function getTemplate (id) {
  return TEMPLATES.find(t => t.id === id) || null
}

export const ANIMATIONS = ['fade', 'slide-up', 'slide-down', 'slide-left', 'slide-right', 'wipe-left', 'wipe-right']
