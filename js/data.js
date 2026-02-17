// ============================================================
// CLIMATE QUEST PAKISTAN - Game Data
// All scenarios, events, achievements, and educational content
// ============================================================

const GAME_DATA = {

  // ── Difficulty Presets ──────────────────────────────────────
  difficulty: {
    explorer: {
      label: 'Explorer',
      description: 'More resources, gentler consequences — great for beginners',
      startResources: { budget: 120, water: 120, energy: 120, trust: 70, biodiversity: 70 },
      eventSeverity: 0.6
    },
    planner: {
      label: 'Planner',
      description: 'Balanced challenge — the recommended experience',
      startResources: { budget: 100, water: 100, energy: 100, trust: 50, biodiversity: 50 },
      eventSeverity: 1.0
    },
    expert: {
      label: 'Expert',
      description: 'Scarce resources, harsh outcomes — for climate champions',
      startResources: { budget: 80, water: 80, energy: 80, trust: 35, biodiversity: 35 },
      eventSeverity: 1.4
    }
  },

  // ── Climate Zones & Scenarios ──────────────────────────────
  zones: [
    // ─── Zone 1: Indus River Belt ────────────────────────────
    {
      id: 'indus',
      name: 'Indus River Belt',
      challenge: 'Flood Zone',
      icon: '\u{1F30A}',
      mapPosition: { top: '45%', left: '35%' },
      color: '#1565c0',
      gradient: 'linear-gradient(135deg, #0d47a1, #1976d2, #42a5f5)',
      particleClass: 'rain',
      description: 'The mighty Indus feeds millions but monsoon fury turns it into a force of destruction. The 2022 super floods submerged one-third of Pakistan.',
      scenario: {
        title: 'Monsoon Crisis',
        narrative: 'Heavy monsoon rains have been pounding the Indus basin for three weeks straight. River levels are rising dangerously. Satellite imagery shows massive flooding upstream. Villages along the riverbank are at immediate risk. As Climate Planner, you must decide how to protect the communities before the worst hits.',
        image_mood: 'flood',
        choices: [
          {
            title: 'Build Embankments & Levees',
            description: 'Invest heavily in engineered flood barriers along critical stretches of the river to hold back rising waters.',
            effects: { budget: -30, water: +5, energy: -10, trust: +15, biodiversity: -5 },
            resilience: 20,
            outcome: 'The embankments hold against the surge! Several villages are saved. However, the massive construction disrupts some natural wetlands that previously absorbed excess water. The communities are grateful, but long-term river ecology suffers slightly.',
            fact: 'Pakistan\'s 2022 super floods affected 33 million people and caused $30 billion in damage. Engineered flood defenses saved many areas but cannot replace natural flood absorption systems.',
            quality: 'good'
          },
          {
            title: 'Reforest & Restore Wetlands',
            description: 'Launch an emergency tree-planting and wetland restoration program to create natural flood buffers along the river.',
            effects: { budget: -20, water: +15, energy: -5, trust: +10, biodiversity: +20 },
            resilience: 25,
            outcome: 'Nature-based solutions begin working! Restored wetlands absorb significant floodwater and new trees stabilize riverbanks. The approach takes longer to show full results but creates lasting protection. Local ecosystems thrive and communities learn sustainable practices.',
            fact: 'Mangrove forests and wetlands can absorb up to 5 times more water than concrete infrastructure. Pakistan lost 70% of its wetlands in the last 50 years, dramatically worsening flood impacts.',
            quality: 'best'
          },
          {
            title: 'Emergency Evacuation Only',
            description: 'Focus all resources on evacuating people to higher ground. Save lives now, deal with infrastructure later.',
            effects: { budget: -10, water: -15, energy: -15, trust: -5, biodiversity: -10 },
            resilience: 8,
            outcome: 'People are evacuated in time, saving lives. But homes, crops, and livestock are lost to the floodwaters. Displaced families crowd into relief camps with poor sanitation. Disease outbreaks follow. Without addressing root causes, next year\'s monsoon will bring the same devastation.',
            fact: 'In the 2022 floods, over 1,700 people died and 7.9 million were displaced. Reactive evacuation saves lives but without adaptation, communities remain trapped in cycles of disaster and recovery.',
            quality: 'poor'
          }
        ],
        reflection: 'Why did the floods cause so much damage? Could better land-use planning have reduced the impact? What role do forests play in protecting against floods?'
      }
    },

    // ─── Zone 2: Northern Mountains ──────────────────────────
    {
      id: 'glacial',
      name: 'Northern Mountains',
      challenge: 'Glacier Zone',
      icon: '\u{1F3D4}\u{FE0F}',
      mapPosition: { top: '10%', left: '45%' },
      color: '#00838f',
      gradient: 'linear-gradient(135deg, #006064, #00838f, #4dd0e1)',
      particleClass: 'snow',
      description: 'Pakistan has over 7,000 glaciers — more than anywhere outside the poles. They\'re melting faster than ever, threatening glacial lake outburst floods (GLOFs).',
      scenario: {
        title: 'Glacial Lake Warning',
        narrative: 'Scientists report that a massive glacial lake in Gilgit-Baltistan has swollen to critical levels. Warmer temperatures are accelerating ice melt at an alarming rate. If the natural dam breaks, a wall of water, rocks, and debris will rush down the valley. Thousands of people live downstream. You have limited time and resources.',
        image_mood: 'glacier',
        choices: [
          {
            title: 'Install Early Warning Systems',
            description: 'Deploy sensors, sirens, and communication networks so communities can evacuate before a glacial lake outburst flood (GLOF) strikes.',
            effects: { budget: -20, water: +5, energy: -10, trust: +20, biodiversity: 0 },
            resilience: 22,
            outcome: 'The warning system detects rising water levels and alerts communities hours before the lake breaches. Thousands evacuate safely. The system becomes a model for other glacial valleys. However, the underlying problem of glacial melt continues unchecked.',
            fact: 'Pakistan experienced 36 GLOF events between 2010-2022. Early warning systems can reduce deaths by up to 90%, but only 15% of at-risk glacial lakes in Pakistan are currently monitored.',
            quality: 'good'
          },
          {
            title: 'Controlled Lake Drainage',
            description: 'Engineer a controlled release of glacial lake water through channels, reducing pressure before it becomes catastrophic.',
            effects: { budget: -35, water: +10, energy: -15, trust: +15, biodiversity: +5 },
            resilience: 28,
            outcome: 'Engineers carefully drain excess water through constructed channels, preventing a catastrophic burst. The controlled water flow is even channeled for irrigation downstream. It\'s expensive and technically challenging, but eliminates the immediate GLOF threat entirely.',
            fact: 'Controlled drainage of dangerous glacial lakes has been successfully used in Nepal and Bhutan. Pakistan\'s Shishper glacier created a new dangerous lake in 2019 that required emergency drainage.',
            quality: 'best'
          },
          {
            title: 'Promote Eco-Tourism',
            description: 'Develop sustainable tourism to fund community resilience while raising global awareness about glacial threats.',
            effects: { budget: +10, water: -5, energy: -5, trust: +5, biodiversity: -10 },
            resilience: 10,
            outcome: 'Tourism brings in revenue and international attention, but does nothing to address the immediate GLOF danger. Tourist infrastructure actually increases the number of people at risk. When a partial breach occurs, the lack of direct action is painfully obvious.',
            fact: 'Climate tourism can raise awareness, but without direct investment in safety infrastructure, it increases vulnerability. The Karakoram Highway, Pakistan\'s main tourist route to the north, has been blocked over 20 times by GLOF events.',
            quality: 'poor'
          }
        ],
        reflection: 'Why are glaciers melting faster now? How does glacier loss in the mountains affect communities hundreds of kilometers downstream? What does climate migration mean for mountain people?'
      }
    },

    // ─── Zone 3: Punjab Urban Belt ───────────────────────────
    {
      id: 'heatwave',
      name: 'Punjab Urban Belt',
      challenge: 'Heat & Smog Zone',
      icon: '\u{1F321}\u{FE0F}',
      mapPosition: { top: '40%', left: '52%' },
      color: '#e65100',
      gradient: 'linear-gradient(135deg, #bf360c, #e65100, #ff9800)',
      particleClass: 'heat',
      description: 'Lahore and Punjab face deadly heatwaves exceeding 50\u00B0C. Concrete jungles trap heat, and vulnerable communities have nowhere to cool down.',
      scenario: {
        title: 'Deadly Heatwave',
        narrative: 'A brutal heatwave grips Lahore. Temperatures have crossed 49\u00B0C for four consecutive days. Hospitals are overwhelmed with heatstroke patients. Power grids are failing under the load of air conditioners. Daily wage workers, the elderly, and children in low-income neighborhoods are most at risk. The city is suffocating.',
        image_mood: 'heat',
        choices: [
          {
            title: 'Urban Greening Campaign',
            description: 'Launch a massive tree-planting drive and create green corridors, rooftop gardens, and urban parks to naturally cool the city.',
            effects: { budget: -25, water: -10, energy: +10, trust: +15, biodiversity: +25 },
            resilience: 28,
            outcome: 'Thousands of trees are planted along major roads and in neighborhoods. Rooftop gardens bloom across the city. Within seasons, temperature in greened areas drops by 3-5\u00B0C. The campaign also engages youth volunteers, building community spirit and environmental awareness.',
            fact: 'Urban trees can reduce surrounding air temperature by 2-8\u00B0C. Lahore lost over 70% of its tree cover in the last 20 years due to rapid urbanization. The city\'s famous Canal Road trees were cut for a bus rapid transit project.',
            quality: 'best'
          },
          {
            title: 'Open Emergency Cooling Centers',
            description: 'Set up air-conditioned shelters across the city where people can escape the heat, with free water and medical support.',
            effects: { budget: -20, water: -5, energy: -20, trust: +20, biodiversity: 0 },
            resilience: 15,
            outcome: 'Cooling centers save lives immediately. The elderly, laborers, and homeless find refuge. But the centers consume enormous energy, straining the already-failing grid. When the power goes out in two centers, the situation becomes dangerous again. It\'s a band-aid, not a cure.',
            fact: 'Jacobabad in Sindh regularly exceeds the \"wet-bulb\" temperature threshold where the human body can no longer cool itself through sweating. Pakistan\'s heatwave deaths increased 600% between 2000-2020.',
            quality: 'good'
          },
          {
            title: 'Ignore — Focus Budget Elsewhere',
            description: 'Heatwaves are temporary. Save the budget for other priorities and let people manage on their own as they always have.',
            effects: { budget: +5, water: -20, energy: -10, trust: -25, biodiversity: -15 },
            resilience: -5,
            outcome: 'The heatwave kills hundreds, mostly daily wage workers and elderly people in low-income areas. Hospitals are overwhelmed. Public anger erupts. Water sources dry up as everyone tries to cope individually. The lack of action destroys public trust and leaves the city more vulnerable to the next heatwave.',
            fact: 'In 2015, a single heatwave in Karachi killed over 1,200 people. Ignoring climate threats doesn\'t save money — it multiplies costs through healthcare, lost productivity, and emergency response.',
            quality: 'terrible'
          }
        ],
        reflection: 'What is the urban heat island effect? Why do poor communities suffer more during heatwaves? How can city planning reduce heat risk?'
      }
    },

    // ─── Zone 4: Sindh Coastal Area ──────────────────────────
    {
      id: 'coastal',
      name: 'Sindh Coastal Area',
      challenge: 'Sea-Level & Cyclone Risk',
      icon: '\u{1F3DD}\u{FE0F}',
      mapPosition: { top: '68%', left: '28%' },
      color: '#00695c',
      gradient: 'linear-gradient(135deg, #004d40, #00695c, #26a69a)',
      particleClass: 'storm',
      description: 'Rising sea levels threaten Sindh\'s coast. Cyclone intensity is increasing, and fishing communities face saltwater intrusion destroying their farmland.',
      scenario: {
        title: 'Cyclone Approaching',
        narrative: 'A Category 3 cyclone is forming in the Arabian Sea, heading directly for the Sindh coast. Fishing villages and the port city of Badin are in its path. Meanwhile, saltwater has been creeping further inland each year, poisoning wells and killing crops. The cyclone will only accelerate this devastation. You must prepare.',
        image_mood: 'storm',
        choices: [
          {
            title: 'Restore Mangrove Forests',
            description: 'Mobilize communities to plant and restore mangrove forests along the coastline — nature\'s own storm barrier and carbon sink.',
            effects: { budget: -20, water: +10, energy: -5, trust: +15, biodiversity: +30 },
            resilience: 30,
            outcome: 'Mangrove restoration creates a living shield against the cyclone\'s storm surge. The forest absorbs wave energy, reducing flooding by 60% in protected areas. Mangroves also trap sediment, slowly reclaiming land from saltwater. Fish populations boom in the mangrove nurseries, reviving livelihoods.',
            fact: 'Pakistan\'s Indus Delta mangroves have shrunk from 600,000 hectares to under 130,000. A single hectare of mangroves can absorb storm surge energy equivalent to a concrete seawall costing $100,000.',
            quality: 'best'
          },
          {
            title: 'Build Concrete Seawalls',
            description: 'Construct engineered seawalls and breakwaters to physically block storm surge and rising seas.',
            effects: { budget: -35, water: 0, energy: -15, trust: +10, biodiversity: -15 },
            resilience: 18,
            outcome: 'The seawalls hold against the cyclone\'s initial surge, protecting the town center. But the walls redirect wave energy to unprotected areas, devastating neighboring villages. Concrete barriers also destroy tidal habitats. The walls need constant maintenance and will eventually be overwhelmed by rising seas.',
            fact: 'Hard engineering solutions often create a false sense of security. In Japan, communities behind seawalls during the 2011 tsunami suffered more casualties because they didn\'t evacuate, trusting the walls.',
            quality: 'good'
          },
          {
            title: 'Relocate Inland',
            description: 'Use resources to move coastal communities further inland, away from the immediate threat of cyclones and sea-level rise.',
            effects: { budget: -25, water: -5, energy: -10, trust: -15, biodiversity: +5 },
            resilience: 12,
            outcome: 'Families reluctantly leave their ancestral homes. The move saves lives during the cyclone, but communities lose their fishing livelihoods and cultural connections to the coast. Many return after the storm despite the danger. Forced relocation breeds resentment without alternative livelihood support.',
            fact: 'Climate-induced displacement is expected to affect 216 million people globally by 2050. In Sindh, over 40% of the delta has been lost to sea-level rise and reduced river flows, displacing fishing communities.',
            quality: 'poor'
          }
        ],
        reflection: 'Why are cyclones getting stronger? What happens to communities when the sea takes their land? Can nature-based solutions outperform engineering?'
      }
    },

    // ─── Zone 5: Balochistan ─────────────────────────────────
    {
      id: 'drought',
      name: 'Balochistan',
      challenge: 'Drought Zone',
      icon: '\u{1F3DC}\u{FE0F}',
      mapPosition: { top: '55%', left: '15%' },
      color: '#f57f17',
      gradient: 'linear-gradient(135deg, #e65100, #f57f17, #ffb74d)',
      particleClass: 'dust',
      description: 'Balochistan faces chronic drought. Groundwater is depleting fast, crops are failing, and pastoral communities are losing livestock.',
      scenario: {
        title: 'Water Crisis',
        narrative: 'Balochistan is in the grip of its worst drought in decades. Rainfall is 60% below normal. Wells that sustained communities for generations are drying up. Livestock are dying. Farmers face an impossible choice: keep planting water-hungry crops or abandon their fields. Tensions rise as communities compete for shrinking water supplies.',
        image_mood: 'drought',
        choices: [
          {
            title: 'Climate-Smart Agriculture',
            description: 'Introduce drought-resistant crop varieties, drip irrigation, and soil conservation techniques adapted to arid conditions.',
            effects: { budget: -25, water: +20, energy: -5, trust: +15, biodiversity: +15 },
            resilience: 28,
            outcome: 'Farmers adopt drought-resistant wheat and millet varieties. Drip irrigation cuts water use by 70% while maintaining yields. Soil mulching reduces evaporation. The approach requires training and patience, but communities that adopt it thrive even as the drought continues.',
            fact: 'Drip irrigation uses 30-70% less water than flood irrigation, which is still the dominant method in Pakistan. Israel transformed its desert agriculture with drip irrigation — Pakistan\'s Balochistan has similar potential.',
            quality: 'best'
          },
          {
            title: 'Deep Groundwater Extraction',
            description: 'Drill deeper bore wells and install powerful pumps to access underground aquifers that still hold water.',
            effects: { budget: -15, water: +10, energy: -20, trust: +5, biodiversity: -20 },
            resilience: 8,
            outcome: 'New wells provide immediate relief, and water flows again. But the deep pumping rapidly depletes ancient aquifers that took thousands of years to fill. Water tables drop further, making shallow wells useless. Within a few years, even the deep wells run dry. The short-term fix creates a long-term catastrophe.',
            fact: 'Pakistan\'s groundwater is depleting at one of the fastest rates in the world. Balochistan\'s water table has dropped by over 100 feet in many areas. Once these fossil aquifers are empty, they cannot be refilled in human timescales.',
            quality: 'poor'
          },
          {
            title: 'Karez System Revival',
            description: 'Restore the ancient Karez underground water channels that have sustainably delivered water for centuries before being neglected.',
            effects: { budget: -20, water: +15, energy: +5, trust: +20, biodiversity: +10 },
            resilience: 25,
            outcome: 'The ancient Karez channels are cleaned and restored with community labor. These gravity-fed systems deliver water without pumping, using no energy. Elders share traditional knowledge with youth. The project revives cultural pride while providing sustainable water access.',
            fact: 'Karez systems are 3,000-year-old Persian engineering marvels — underground channels that use gravity to deliver water. Balochistan once had over 3,000 functioning Karez; today fewer than 500 remain operational.',
            quality: 'good'
          }
        ],
        reflection: 'Where does our water come from? What happens when we use water faster than nature can replenish it? How did ancient civilizations manage water in dry climates?'
      }
    },

    // ─── Zone 6: Karachi ─────────────────────────────────────
    {
      id: 'karachi',
      name: 'Karachi',
      challenge: 'Urban Waste & Drainage Crisis',
      icon: '\u{1F3D9}\u{FE0F}',
      mapPosition: { top: '72%', left: '42%' },
      color: '#6a1b9a',
      gradient: 'linear-gradient(135deg, #4a148c, #6a1b9a, #ab47bc)',
      particleClass: 'smog',
      description: 'Pakistan\'s largest city drowns in urban flooding every monsoon. Clogged drains, unmanaged waste, and unplanned construction turn rain into disaster.',
      scenario: {
        title: 'Urban Flood Emergency',
        narrative: 'Monsoon rains hit Karachi and within hours, streets transform into rivers. Nullahs (storm drains) are clogged with decades of garbage and illegal construction. Sewage mixes with floodwater, creating a toxic soup flowing through neighborhoods. Traffic is paralyzed. People are trapped. This happens every single year, and every year, nothing changes.',
        image_mood: 'urban_flood',
        choices: [
          {
            title: 'Clean & Restore Drainage System',
            description: 'Launch a massive campaign to clear nullahs, remove encroachments, restore natural waterways, and build proper waste management infrastructure.',
            effects: { budget: -30, water: +15, energy: -10, trust: +25, biodiversity: +15 },
            resilience: 30,
            outcome: 'Thousands of tons of garbage are removed from storm drains. Illegal encroachments on nullahs are cleared (with relocation support). Natural water channels are restored. The next rain drains in hours instead of days. Communities take ownership of keeping drains clean. A city-wide waste collection system prevents future clogging.',
            fact: 'Karachi generates 12,000 tons of garbage daily, but only 50% is collected. The rest ends up in drains, rivers, and the sea. The city\'s drainage system was designed for 5 million people — it now serves 20 million.',
            quality: 'best'
          },
          {
            title: 'Pump Stations & Emergency Response',
            description: 'Install powerful pumping stations at flood-prone intersections and create a dedicated flood emergency response team.',
            effects: { budget: -25, water: +5, energy: -20, trust: +10, biodiversity: -5 },
            resilience: 15,
            outcome: 'Pump stations remove water faster from major roads, keeping key arteries open. The emergency team rescues stranded residents. But pumps merely move water from one area to another, often flooding poorer neighborhoods. The root cause — clogged drains and poor planning — remains untouched.',
            fact: 'Karachi spends billions on emergency flood response every year — many times more than it would cost to fix the drainage system permanently. This is the "disaster trap": spending more on response than prevention.',
            quality: 'good'
          },
          {
            title: 'Blame & Deflect Responsibility',
            description: 'Issue statements blaming federal government and previous administrations. Promise action "next year" and provide minimal relief supplies.',
            effects: { budget: +5, water: -15, energy: -5, trust: -30, biodiversity: -10 },
            resilience: -10,
            outcome: 'People are furious. Social media erupts with videos of flooded streets and stranded families. Communities feel abandoned. Preventable deaths occur in electrocution from exposed wiring in floodwater. Public trust collapses entirely. The same disaster will repeat next monsoon, worse than before.',
            fact: 'Between 2007 and 2022, Karachi lost an estimated PKR 500 billion in property damage, lost productivity, and health costs from urban flooding — all largely preventable with proper drainage and waste management.',
            quality: 'terrible'
          }
        ],
        reflection: 'Why does the same city flood every year? What is the connection between waste management and climate resilience? Who is most affected by urban flooding and why?'
      }
    }
  ],

  // ── Random Events (between zones) ─────────────────────────
  events: [
    {
      title: 'International Climate Aid',
      description: 'The Green Climate Fund approves emergency funding for Pakistan\'s adaptation programs!',
      icon: '\u{1F30D}',
      effects: { budget: +20, trust: +5 },
      type: 'positive'
    },
    {
      title: 'Youth Climate March',
      description: 'Thousands of young Pakistanis march for climate action, inspired by your leadership. Community spirit soars!',
      icon: '\u{270A}',
      effects: { trust: +15, biodiversity: +5 },
      type: 'positive'
    },
    {
      title: 'Solar Panel Donation',
      description: 'An international NGO donates solar panels for rural electrification. Energy resources boosted!',
      icon: '\u{2600}\u{FE0F}',
      effects: { energy: +15, budget: +5 },
      type: 'positive'
    },
    {
      title: 'Community Tree Planting',
      description: 'Volunteers plant 10,000 trees across multiple districts as part of a nationwide green campaign.',
      icon: '\u{1F333}',
      effects: { biodiversity: +15, water: +5, trust: +5 },
      type: 'positive'
    },
    {
      title: 'Corruption Scandal',
      description: 'Disaster relief funds are found embezzled by local officials. Budget takes a hit and public trust wavers.',
      icon: '\u{1F4B8}',
      effects: { budget: -15, trust: -10 },
      type: 'negative'
    },
    {
      title: 'Unexpected Earthquake',
      description: 'A 5.8 magnitude earthquake strikes northern regions, diverting resources to emergency relief.',
      icon: '\u{1F30B}',
      effects: { budget: -15, energy: -10 },
      type: 'negative'
    },
    {
      title: 'Severe Locust Swarm',
      description: 'Desert locusts from East Africa sweep through Sindh and Punjab, devouring crops and vegetation.',
      icon: '\u{1F997}',
      effects: { biodiversity: -15, water: -5, trust: -5 },
      type: 'negative'
    },
    {
      title: 'Cross-Border Smog',
      description: 'Crop burning across the border sends thick smog blankets over Punjab. Air quality plummets.',
      icon: '\u{1F32B}\u{FE0F}',
      effects: { biodiversity: -10, trust: -10, energy: -5 },
      type: 'negative'
    },
    {
      title: 'Billion Tree Tsunami Success',
      description: 'KP\'s tree planting program shows remarkable results, inspiring other provinces to follow suit.',
      icon: '\u{1F332}',
      effects: { biodiversity: +20, trust: +10 },
      type: 'positive'
    },
    {
      title: 'Water Treaty Dispute',
      description: 'Tensions over the Indus Waters Treaty create uncertainty about future water allocations.',
      icon: '\u{26A0}\u{FE0F}',
      effects: { water: -15, trust: -5 },
      type: 'negative'
    },
    {
      title: 'Research Breakthrough',
      description: 'Pakistani scientists develop a new drought-resistant wheat variety. Agricultural resilience improves!',
      icon: '\u{1F52C}',
      effects: { water: +10, biodiversity: +10, trust: +5 },
      type: 'positive'
    },
    {
      title: 'Power Grid Failure',
      description: 'A nationwide blackout hits during peak summer. The aging power infrastructure buckles under demand.',
      icon: '\u{26A1}',
      effects: { energy: -20, trust: -10 },
      type: 'negative'
    }
  ],

  // ── Achievements ───────────────────────────────────────────
  achievements: [
    {
      id: 'first_responder',
      title: 'First Responder',
      description: 'Complete your first climate zone',
      icon: '\u{1F396}\u{FE0F}',
      condition: (state) => state.zonesCompleted >= 1
    },
    {
      id: 'water_guardian',
      title: 'Water Guardian',
      description: 'Keep water resources above 80 throughout',
      icon: '\u{1F4A7}',
      condition: (state) => state.waterNeverBelow80
    },
    {
      id: 'peoples_champion',
      title: 'People\'s Champion',
      description: 'Reach community trust of 90 or higher',
      icon: '\u{1F91D}',
      condition: (state) => state.maxTrust >= 90
    },
    {
      id: 'green_hero',
      title: 'Green Hero',
      description: 'Reach biodiversity score of 90 or higher',
      icon: '\u{1F33F}',
      condition: (state) => state.maxBiodiversity >= 90
    },
    {
      id: 'budget_master',
      title: 'Budget Master',
      description: 'Complete the game with budget above 50',
      icon: '\u{1F4B0}',
      condition: (state) => state.resources.budget > 50 && state.zonesCompleted === 6
    },
    {
      id: 'climate_champion',
      title: 'Climate Champion',
      description: 'Achieve a National Resilience Score above 80%',
      icon: '\u{1F3C6}',
      condition: (state) => state.resilience >= (state.maxResilience * 0.8)
    },
    {
      id: 'perfect_planner',
      title: 'Perfect Planner',
      description: 'Complete all zones without any resource dropping below 20',
      icon: '\u{2B50}',
      condition: (state) => state.neverBelow20 && state.zonesCompleted === 6
    },
    {
      id: 'nature_first',
      title: 'Nature First',
      description: 'Choose the nature-based solution in every zone',
      icon: '\u{1F33B}',
      condition: (state) => state.bestChoices >= 6
    },
    {
      id: 'full_sweep',
      title: 'Full Sweep',
      description: 'Complete all six climate zones',
      icon: '\u{1F5FA}\u{FE0F}',
      condition: (state) => state.zonesCompleted === 6
    },
    {
      id: 'survivor',
      title: 'Survivor',
      description: 'Recover from a resource dropping below 10',
      icon: '\u{1F4AA}',
      condition: (state) => state.recoveredFromCritical
    }
  ],

  // ── Resource Metadata ──────────────────────────────────────
  resources: {
    budget:       { label: 'Budget',           icon: '\u{1F4B0}', color: '#ffd54f', maxLabel: 'Full Funding' },
    water:        { label: 'Water',            icon: '\u{1F4A7}', color: '#42a5f5', maxLabel: 'Abundant' },
    energy:       { label: 'Energy',           icon: '\u{26A1}',  color: '#ffb74d', maxLabel: 'Full Power' },
    trust:        { label: 'Community Trust',  icon: '\u{1F91D}', color: '#ef5350', maxLabel: 'Maximum' },
    biodiversity: { label: 'Biodiversity',     icon: '\u{1F33F}', color: '#66bb6a', maxLabel: 'Thriving' }
  },

  // ── Grade Thresholds ───────────────────────────────────────
  grades: [
    { min: 90, grade: 'A+', title: 'Climate Legend',    message: 'You have built a truly resilient Pakistan! Future generations will thrive because of your leadership.' },
    { min: 80, grade: 'A',  title: 'Climate Champion',  message: 'Exceptional planning! Pakistan is well-prepared to face climate challenges head-on.' },
    { min: 70, grade: 'B',  title: 'Strong Planner',    message: 'Good work! Your decisions have made Pakistan more resilient, though some vulnerabilities remain.' },
    { min: 55, grade: 'C',  title: 'Learning Leader',   message: 'A decent start, but there is room for improvement. Some communities are still at risk.' },
    { min: 40, grade: 'D',  title: 'Needs Improvement', message: 'Your choices left many communities vulnerable. Study the climate facts and try again!' },
    { min: 0,  grade: 'F',  title: 'Climate Crisis',    message: 'Pakistan is in trouble. Many bad decisions left communities devastated. Learn from the facts and try again!' }
  ]
};
