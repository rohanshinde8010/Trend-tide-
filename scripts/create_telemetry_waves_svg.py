# Generate high-precision topographic wave and telemetry grid SVG
svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900" viewBox="0 0 1440 900" fill="none">
  <defs>
    <!-- Gemstone Gradients for Waves -->
    <linearGradient id="waveGradVioletCyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#9D00FF" stop-opacity="0.35"/>
      <stop offset="50%" stop-color="#00E1FF" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#62FF00" stop-opacity="0.2"/>
    </linearGradient>
    <linearGradient id="waveGradSlate" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#64748B" stop-opacity="0.3"/>
      <stop offset="50%" stop-color="#94A3B8" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="#CBD5E1" stop-opacity="0.15"/>
    </linearGradient>
    <pattern id="telemetryGrid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#94A3B8" stroke-width="0.75" stroke-opacity="0.18"/>
      <circle cx="0" cy="0" r="1.5" fill="#64748B" fill-opacity="0.35"/>
      <circle cx="48" cy="0" r="1.5" fill="#64748B" fill-opacity="0.35"/>
      <circle cx="0" cy="48" r="1.5" fill="#64748B" fill-opacity="0.35"/>
      <circle cx="48" cy="48" r="1.5" fill="#64748B" fill-opacity="0.35"/>
    </pattern>
    <radialGradient id="orbViolet" cx="15%" cy="15%" r="45%">
      <stop offset="0%" stop-color="#9D00FF" stop-opacity="0.16"/>
      <stop offset="60%" stop-color="#9D00FF" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="#9D00FF" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="orbCyan" cx="85%" cy="20%" r="40%">
      <stop offset="0%" stop-color="#00E1FF" stop-opacity="0.15"/>
      <stop offset="60%" stop-color="#00E1FF" stop-opacity="0.03"/>
      <stop offset="100%" stop-color="#00E1FF" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="orbLime" cx="50%" cy="85%" r="50%">
      <stop offset="0%" stop-color="#62FF00" stop-opacity="0.12"/>
      <stop offset="70%" stop-color="#62FF00" stop-opacity="0.02"/>
      <stop offset="100%" stop-color="#62FF00" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Base Grid Texture -->
  <rect width="1440" height="900" fill="url(#telemetryGrid)"/>

  <!-- Radiant Gemstone Ambient Auras -->
  <rect width="1440" height="900" fill="url(#orbViolet)"/>
  <rect width="1440" height="900" fill="url(#orbCyan)"/>
  <rect width="1440" height="900" fill="url(#orbLime)"/>

  <!-- Topographic Wave Contour Lines (Flowing Signals) -->
  <g stroke-linecap="round" fill="none">
    <!-- Wave Cluster A - Upper Arc -->
    <path d="M-100 220 C 250 80, 500 360, 850 180 C 1150 20, 1350 280, 1600 120" stroke="url(#waveGradVioletCyan)" stroke-width="2.5"/>
    <path d="M-100 260 C 260 120, 520 400, 860 220 C 1160 60, 1360 320, 1600 160" stroke="url(#waveGradSlate)" stroke-width="1.8" stroke-dasharray="8 6"/>
    <path d="M-100 300 C 270 160, 540 440, 870 260 C 1170 100, 1370 360, 1600 200" stroke="url(#waveGradVioletCyan)" stroke-width="1.2"/>
    <path d="M-100 340 C 280 200, 560 480, 880 300 C 1180 140, 1380 400, 1600 240" stroke="url(#waveGradSlate)" stroke-width="1"/>

    <!-- Wave Cluster B - Midfield Telemetry Surge -->
    <path d="M-80 520 C 280 680, 620 380, 950 560 C 1220 720, 1420 480, 1620 600" stroke="url(#waveGradVioletCyan)" stroke-width="2.2"/>
    <path d="M-80 560 C 290 720, 640 420, 960 600 C 1230 760, 1430 520, 1620 640" stroke="url(#waveGradSlate)" stroke-width="1.5"/>
    <path d="M-80 600 C 300 760, 660 460, 970 640 C 1240 800, 1440 560, 1620 680" stroke="url(#waveGradVioletCyan)" stroke-width="1.8" stroke-dasharray="12 8"/>
    <path d="M-80 640 C 310 800, 680 500, 980 680 C 1250 840, 1450 600, 1620 720" stroke="url(#waveGradSlate)" stroke-width="1"/>

    <!-- Wave Cluster C - Low Ground Harmonic Elevation -->
    <path d="M-50 780 C 350 640, 750 890, 1150 740 C 1350 660, 1500 820, 1650 750" stroke="url(#waveGradVioletCyan)" stroke-width="1.6"/>
    <path d="M-50 820 C 360 680, 770 930, 1160 780 C 1360 700, 1510 860, 1650 790" stroke="url(#waveGradSlate)" stroke-width="1.2"/>
    <path d="M-50 860 C 370 720, 790 970, 1170 820 C 1370 740, 1520 900, 1650 830" stroke="url(#waveGradSlate)" stroke-width="0.8"/>
  </g>

  <!-- Technical Coordinate Markers -->
  <g font-family="monospace" font-size="10" fill="#64748B" fill-opacity="0.45">
    <text x="36" y="60">SYS_LAT 37.7749 // LON -122.4194</text>
    <text x="36" y="860">TRENDTIDE_TELEMETRY // REGIONAL_NODE: ACTIVE</text>
    <text x="1180" y="60">BANDWIDTH 100Gbps</text>
    <text x="1220" y="860">ELEVATION 240m</text>
  </g>
</svg>'''

with open('client/public/bg-telemetry-waves.svg', 'w', encoding='utf-8') as f:
    f.write(svg_content)

print("Created client/public/bg-telemetry-waves.svg")

