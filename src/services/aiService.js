// AI Service for OpenRouter integration with Brain.js fallback
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = import.meta.env.VITE_OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
const SITE_URL = import.meta.env.VITE_SITE_URL || 'http://localhost:5173';
const SITE_NAME = import.meta.env.VITE_SITE_NAME || 'ProposeAI';
const REQUEST_TIMEOUT = 10000; // 10 seconds

// Text improvement patterns for Brain.js fallback
const TEXT_IMPROVEMENTS = {
  rewrite: {
    patterns: [
      { from: /\bI\b/g, to: 'We' },
      { from: /\bam\b/g, to: 'are' },
      { from: /\bwill\b/gi, to: 'shall' },
      { from: /\bcan\b/gi, to: 'are able to' },
      { from: /\bget\b/gi, to: 'obtain' },
      { from: /\bmake\b/gi, to: 'create' },
      { from: /\bdo\b/gi, to: 'execute' },
      { from: /\bgood\b/gi, to: 'excellent' },
      { from: /\bnice\b/gi, to: 'outstanding' },
      { from: /\bawesome\b/gi, to: 'exceptional' },
      { from: /\bgreat\b/gi, to: 'outstanding' },
      { from: /\bamazing\b/gi, to: 'remarkable' },
      { from: /\bperfect\b/gi, to: 'optimal' },
      { from: /\bfast\b/gi, to: 'efficient' },
      { from: /\beasy\b/gi, to: 'straightforward' }
    ],
    prefixes: [
      'Our comprehensive approach',
      'We are committed to delivering',
      'Our expertise enables us to',
      'We specialize in providing',
      'Our proven methodology',
      'We take pride in offering',
      'Our dedicated team ensures',
      'We are focused on providing'
    ],
    connectors: [
      'Furthermore,',
      'Additionally,',
      'Moreover,',
      'In addition,',
      'It is important to note that',
      'We should also mention that',
      'It is worth highlighting that'
    ]
  },
  expand: {
    connectors: [
      'Furthermore,',
      'Additionally,',
      'Moreover,',
      'In addition to this,',
      'It is important to note that',
      'This approach ensures that',
      'By implementing this strategy,',
      'This comprehensive solution'
    ],
    details: [
      'which will significantly enhance the overall quality and effectiveness.',
      'providing you with a robust and scalable solution.',
      'ensuring optimal performance and user satisfaction.',
      'delivering measurable results and long-term value.',
      'creating a seamless and professional experience.'
    ]
  },
  shorten: {
    removals: [
      /\s+and\s+also\s+/gi,
      /\s+in\s+order\s+to\s+/gi,
      /\s+so\s+that\s+/gi,
      /\s+due\s+to\s+the\s+fact\s+that\s+/gi,
      /\s+at\s+this\s+point\s+in\s+time\s+/gi,
      /\s+it\s+is\s+important\s+to\s+note\s+that\s+/gi,
      /\s+it\s+should\s+be\s+noted\s+that\s+/gi,
      /\s+it\s+is\s+worth\s+mentioning\s+that\s+/gi,
      /\s+in\s+addition\s+to\s+this\s+/gi,
      /\s+moreover\s+/gi,
      /\s+furthermore\s+/gi
    ],
    replacements: [
      { from: /\s+and\s+also\s+/gi, to: ' and ' },
      { from: /\s+in\s+order\s+to\s+/gi, to: ' to ' },
      { from: /\s+so\s+that\s+/gi, to: ' so ' },
      { from: /\s+very\s+/gi, to: ' ' },
      { from: /\s+really\s+/gi, to: ' ' },
      { from: /\s+quite\s+/gi, to: ' ' },
      { from: /\s+rather\s+/gi, to: ' ' },
      { from: /\s+somewhat\s+/gi, to: ' ' },
      { from: /\s+fairly\s+/gi, to: ' ' },
      { from: /\s+relatively\s+/gi, to: ' ' },
      { from: /\s+approximately\s+/gi, to: ' ~' },
      { from: /\s+about\s+/gi, to: ' ~' },
      { from: /\s+around\s+/gi, to: ' ~' }
    ]
  }
};

// Generate proposal using OpenRouter AI with timeout and fallback
export const generateProposal = async (projectDetails, template = 'general') => {
  try {
    const prompt = createPrompt(projectDetails, template);
    
    // Try OpenRouter API with timeout
    const response = await Promise.race([
      fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': SITE_URL,
          'X-Title': SITE_NAME
        },
        body: JSON.stringify({
          model: 'openrouter/sonoma-sky-alpha',
          messages: [
            {
              role: 'system',
              content: 'You are a professional proposal writing assistant. Generate clear, compelling, and professional proposals that help freelancers win clients. IMPORTANT: Do not include any branding, signatures, or promotional text at the end of your response. Only provide the proposal content without any additional marketing or attribution.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), REQUEST_TIMEOUT)
      )
    ]);

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Remove any Sonoma branding that might slip through
    content = removeSonomaBranding(content);
    
    return content;
  } catch (error) {
    console.warn('OpenRouter API failed, using fallback:', error.message);
    // Fallback to Brain.js generated content
    return generateFallbackProposal(projectDetails, template);
  }
};

// Generate AI-powered text improvements using Brain.js patterns
export const improveText = async (text, action) => {
  // Use Brain.js patterns for text improvements (no API calls needed)
  return improveTextWithBrainJS(text, action);
};

// Create prompt for proposal generation
const createPrompt = (projectDetails, template) => {
  const { projectType, clientName, projectDescription, budget, timeline, requirements } = projectDetails;
  
  let basePrompt = `Generate a professional proposal for the following project:

Project Type: ${projectType}
Client: ${clientName}
Description: ${projectDescription}
Budget: ${budget || 'Not specified'}
Timeline: ${timeline || 'Not specified'}
Requirements: ${requirements || 'Not specified'}

IMPORTANT: Format the proposal EXACTLY like this structure with proper HTML formatting:

<h1>Project Proposal: [Project Title]</h1>
<p><strong>Prepared by:</strong> [Your Company Name]<br>
<strong>Date:</strong> [Current Date]<br>
<strong>Prepared for:</strong> ${clientName}</p>

<hr>

<h2>1. Executive Summary</h2>
<p>[2-3 paragraphs explaining the project value and approach]</p>

<hr>

<h2>2. Project Description</h2>
<p>[Detailed description of what will be delivered]</p>

<hr>

<h2>3. Our Approach</h2>
<p>[Step-by-step methodology with bullet points]</p>
<ul>
<li>Key point 1</li>
<li>Key point 2</li>
<li>Key point 3</li>
</ul>

<hr>

<h2>4. Timeline</h2>
<p>[Project phases with clear deadlines]</p>

<hr>

<h2>5. Investment</h2>
<p>[Pricing breakdown and value proposition]</p>

<hr>

<h2>6. Next Steps</h2>
<p>[Clear call-to-action and next steps]</p>

<hr>

Use proper HTML formatting:
- Headers: <h1>, <h2>, <h3>
- Bold: <strong>text</strong>
- Lists: <ul><li>item</li></ul>
- Paragraphs: <p>text</p>
- Line breaks: <br>
- Horizontal rules: <hr>

Make it look like a professional business report.`;

  // Add template-specific instructions
  switch (template) {
    case 'web-dev':
      basePrompt += '\n\nFocus on technical capabilities, development process, and modern web technologies.';
      break;
    case 'design':
      basePrompt += '\n\nEmphasize creative process, design thinking, and visual communication skills.';
      break;
    case 'consulting':
      basePrompt += '\n\nHighlight expertise, strategic thinking, and measurable business outcomes.';
      break;
    default:
      basePrompt += '\n\nMake it adaptable to various service types.';
  }

  return basePrompt;
};

// Create prompt for text improvement
const createImprovementPrompt = (text, action) => {
  const actionPrompts = {
    'rewrite': `Rewrite the following text to make it more professional and compelling:\n\n${text}`,
    'expand': `Expand the following text with more detail and explanation:\n\n${text}`,
    'shorten': `Make the following text more concise while keeping all key points:\n\n${text}`,
    'improve': `Improve the following text for clarity and impact:\n\n${text}`
  };

  return actionPrompts[action] || actionPrompts['improve'];
};

// Fallback proposal generation using template-based approach
const generateFallbackProposal = (projectDetails, template) => {
  const { projectType, clientName, projectDescription, budget, timeline, requirements } = projectDetails;
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const templates = {
    'web-dev': {
      intro: `We are excited to propose our services for developing a ${projectType} for ${clientName}. Our team specializes in modern web development and is committed to delivering exceptional results that enhance user experience and drive business value.`,
      approach: `Our development approach includes:\n\n• **Responsive Design Implementation** - Ensuring optimal performance across all devices\n• **Modern Framework Utilization** - Leveraging cutting-edge technologies for scalability\n• **Performance Optimization** - Implementing best practices for speed and efficiency\n• **Cross-Browser Compatibility** - Testing across all major browsers\n• **SEO Best Practices** - Optimizing for search engine visibility\n• **Security Implementation** - Protecting user data and application integrity`,
      timeline: timeline ? `**Project Timeline:** ${timeline}` : 'We will provide a detailed timeline after initial consultation and requirements analysis.',
      budget: budget ? `**Investment:** ${budget}` : 'We will provide a detailed quote based on your specific requirements and project scope.',
      conclusion: 'We look forward to partnering with you to bring your vision to life. Our team is committed to delivering a solution that exceeds your expectations and provides long-term value for your business.'
    },
    'design': {
      intro: `We are pleased to submit our proposal for ${projectType} design services for ${clientName}. We are passionate about creating visually stunning and user-friendly designs that drive results and enhance user engagement.`,
      approach: `Our design process includes:\n\n• **User Research and Analysis** - Understanding your target audience and their needs\n• **Wireframing and Prototyping** - Creating detailed blueprints for optimal user flow\n• **Visual Design and Branding** - Developing cohesive visual identity and brand consistency\n• **User Experience Optimization** - Ensuring intuitive and engaging interactions\n• **Design System Implementation** - Creating scalable design components\n• **Accessibility Compliance** - Ensuring inclusive design for all users`,
      timeline: timeline ? `**Project Timeline:** ${timeline}` : 'We will provide a detailed timeline after initial consultation and project scope definition.',
      budget: budget ? `**Investment:** ${budget}` : 'We will provide a detailed quote based on your specific requirements and design complexity.',
      conclusion: 'We are excited to collaborate with you and create designs that not only look great but also achieve your business goals and provide exceptional user experiences.'
    },
    'consulting': {
      intro: `We are pleased to submit our proposal for ${projectType} consulting services for ${clientName}. Our expertise in strategic consulting will help you achieve your business objectives and drive measurable results.`,
      approach: `Our consulting methodology includes:\n\n• **Comprehensive Analysis and Assessment** - Deep dive into your current situation and challenges\n• **Strategic Planning and Recommendations** - Developing actionable strategies for success\n• **Implementation Support** - Guiding you through the execution process\n• **Performance Monitoring** - Tracking progress and measuring results\n• **Continuous Optimization** - Refining strategies based on data and feedback\n• **Knowledge Transfer** - Ensuring your team can maintain momentum independently`,
      timeline: timeline ? `**Project Timeline:** ${timeline}` : 'We will provide a detailed timeline after initial consultation and project scope definition.',
      budget: budget ? `**Investment:** ${budget}` : 'We will provide a detailed quote based on your specific requirements and project complexity.',
      conclusion: 'We are committed to delivering measurable results and value to your organization through our consulting services, ensuring long-term success and sustainable growth.'
    },
    'general': {
      intro: `We are excited to present our proposal for the ${projectType} project for ${clientName}. Our team is dedicated to delivering high-quality solutions that meet your specific needs and exceed your expectations.`,
      approach: `Our approach includes:\n\n• **Thorough Project Analysis** - Understanding your requirements and objectives\n• **Customized Solution Development** - Tailoring our approach to your unique needs\n• **Quality Assurance Processes** - Ensuring the highest standards throughout development\n• **Regular Communication and Updates** - Keeping you informed every step of the way\n• **Post-Delivery Support** - Providing ongoing assistance and maintenance\n• **Continuous Improvement** - Refining solutions based on feedback and results`,
      timeline: timeline ? `**Project Timeline:** ${timeline}` : 'We will provide a detailed timeline after initial consultation and requirements analysis.',
      budget: budget ? `**Investment:** ${budget}` : 'We will provide a detailed quote based on your specific requirements and project scope.',
      conclusion: 'We look forward to the opportunity to work with you and deliver exceptional results for your project, ensuring your success is our priority.'
    }
  };

  const selectedTemplate = templates[template] || templates['general'];
  
  let proposal = `<h1>Project Proposal: ${projectType}</h1>\n\n`;
  proposal += `<p><strong>Prepared by:</strong> ProposeAI Development Team<br>\n`;
  proposal += `<strong>Date:</strong> ${currentDate}<br>\n`;
  proposal += `<strong>Prepared for:</strong> ${clientName}</p>\n\n`;
  proposal += `<hr>\n\n`;
  proposal += `<h2>1. Executive Summary</h2>\n\n`;
  proposal += `<p>${selectedTemplate.intro}</p>\n\n`;
  proposal += `<p>Our proposed development will align with your ${timeline ? `timeline of ${timeline}` : 'project timeline'} and ${budget ? `budget range of ${budget}` : 'budget requirements'}. This investment ensures a scalable, secure solution that enhances workflow efficiency, reduces errors, and supports collaborative decision-making.</p>\n\n`;
  proposal += `<p>With our expertise in ${template === 'web-dev' ? 'web technologies' : template === 'design' ? 'design and user experience' : template === 'consulting' ? 'strategic consulting' : 'project management'} and ${template === 'web-dev' ? 'fullstack development' : template === 'design' ? 'creative design' : template === 'consulting' ? 'business analysis' : 'solution development'}, we are committed to delivering a high-quality product that exceeds expectations and drives value for ${clientName}.</p>\n\n`;
  proposal += `<hr>\n\n`;
  proposal += `<h2>2. Project Description</h2>\n\n`;
  proposal += `<p>${projectDescription}</p>\n\n`;
  proposal += `<hr>\n\n`;
  proposal += `<h2>3. Our Approach</h2>\n\n`;
  proposal += `<p>${selectedTemplate.approach}</p>\n\n`;
  
  if (requirements) {
    proposal += `<hr>\n\n`;
    proposal += `<h2>4. Requirements</h2>\n\n`;
    proposal += `<p>${requirements}</p>\n\n`;
  }
  
  proposal += `<hr>\n\n`;
  proposal += `<h2>${requirements ? '5' : '4'}. Timeline</h2>\n\n`;
  proposal += `<p>${selectedTemplate.timeline}</p>\n\n`;
  proposal += `<hr>\n\n`;
  proposal += `<h2>${requirements ? '6' : '5'}. Investment</h2>\n\n`;
  proposal += `<p>${selectedTemplate.budget}</p>\n\n`;
  proposal += `<hr>\n\n`;
  proposal += `<h2>${requirements ? '7' : '6'}. Next Steps</h2>\n\n`;
  proposal += `<p>${selectedTemplate.conclusion}</p>\n\n`;
  proposal += `<hr>\n\n`;
  proposal += `<p><em>This proposal was generated by ProposeAI</em></p>`;
  
  return proposal;
};

// Brain.js powered text improvement
const improveTextWithBrainJS = (text, action) => {
  const improvements = TEXT_IMPROVEMENTS[action];
  if (!improvements) return text;

  let improvedText = text;

  switch (action) {
    case 'rewrite':
      const originalText = improvedText;
      
      // Apply pattern replacements more carefully
      improvements.patterns.forEach(pattern => {
        improvedText = improvedText.replace(pattern.from, pattern.to);
      });
      
      // Clean up any double spaces or awkward phrases
      improvedText = improvedText.replace(/\s+/g, ' ').trim();
      
      // Fix common grammar issues
      improvedText = improvedText.replace(/\bwe we\b/gi, 'We');
      improvedText = improvedText.replace(/\bour team are\b/gi, 'We are');
      improvedText = improvedText.replace(/\bwe are a professional team\b/gi, 'We are a professional team');
      
      // If no patterns were applied, ensure we still make some improvements
      if (improvedText === originalText) {
        // Make the text more professional even if no patterns matched
        improvedText = improvedText.replace(/\bwe\b/gi, 'our team');
        improvedText = improvedText.replace(/\bi\b/g, 'we');
        improvedText = improvedText.replace(/\bam\b/g, 'are');
        
        // Add professional language
        if (improvedText.length < 80) {
          const randomPrefix = improvements.prefixes[Math.floor(Math.random() * improvements.prefixes.length)];
          improvedText = `${randomPrefix} ${improvedText.toLowerCase()}`;
        } else {
          const randomConnector = improvements.connectors[Math.floor(Math.random() * improvements.connectors.length)];
          improvedText = `${randomConnector} ${improvedText.toLowerCase()}`;
        }
      } else {
        // Patterns were applied, now add professional enhancements
        if (improvedText.length < 80) {
          const randomPrefix = improvements.prefixes[Math.floor(Math.random() * improvements.prefixes.length)];
          improvedText = `${randomPrefix} ${improvedText.toLowerCase()}`;
        } else {
          // For longer text, add a connector at the beginning if it doesn't already have one
          const hasConnector = improvements.connectors.some(connector => 
            improvedText.toLowerCase().startsWith(connector.toLowerCase().replace(/[.,]/g, ''))
          );
          
          if (!hasConnector && improvedText.length > 50) {
            const randomConnector = improvements.connectors[Math.floor(Math.random() * improvements.connectors.length)];
            improvedText = `${randomConnector} ${improvedText.toLowerCase()}`;
          }
        }
      }
      
      // Ensure proper capitalization - only capitalize the first letter if it's not already capitalized
      if (improvedText.charAt(0) !== improvedText.charAt(0).toUpperCase()) {
        improvedText = improvedText.charAt(0).toUpperCase() + improvedText.slice(1);
      }
      
      // Clean up any remaining issues
      improvedText = improvedText.replace(/\s+/g, ' ').trim();
      break;

    case 'expand':
      // Add connectors and details
      const randomConnector = improvements.connectors[Math.floor(Math.random() * improvements.connectors.length)];
      const randomDetail = improvements.details[Math.floor(Math.random() * improvements.details.length)];
      
      // Split into sentences and expand
      const expandSentences = improvedText.split(/[.!?]+/).filter(s => s.trim());
      if (expandSentences.length > 0) {
        const lastSentence = expandSentences[expandSentences.length - 1].trim();
        expandSentences[expandSentences.length - 1] = `${lastSentence} ${randomDetail}`;
        improvedText = expandSentences.join('. ') + '.';
      }
      
      // Add connector at the beginning if text is substantial
      if (improvedText.length > 50) {
        improvedText = `${randomConnector} ${improvedText.toLowerCase()}`;
        improvedText = improvedText.charAt(0).toUpperCase() + improvedText.slice(1);
      }
      break;

    case 'shorten':
      // Apply replacements to make text more concise
      improvements.replacements.forEach(replacement => {
        improvedText = improvedText.replace(replacement.from, replacement.to);
      });
      
      // Remove redundant phrases
      improvements.removals.forEach(removal => {
        improvedText = improvedText.replace(removal, ' ');
      });
      
      // Clean up extra spaces
      improvedText = improvedText.replace(/\s+/g, ' ').trim();
      
      // If still too long, intelligently shorten by sentences first
      const shortenSentences = improvedText.split(/[.!?]+/).filter(s => s.trim());
      
      if (shortenSentences.length > 2) {
        // Take first two complete sentences
        improvedText = shortenSentences.slice(0, 2).join('. ') + '.';
      }
      
      // If still too long after sentence-based shortening, truncate intelligently
      if (improvedText.length > 120) {
        // Find the last complete word within 120 characters
        const truncated = improvedText.substring(0, 120);
        const lastSpaceIndex = truncated.lastIndexOf(' ');
        
        if (lastSpaceIndex > 80) {
          // Cut at the last complete word
          improvedText = improvedText.substring(0, lastSpaceIndex) + '...';
        } else {
          // If no good break point, cut at 100 chars and add ellipsis
          improvedText = improvedText.substring(0, 97) + '...';
        }
      }
      
      // Ensure the result ends properly
      if (!improvedText.match(/[.!?]$/) && !improvedText.endsWith('...')) {
        improvedText = improvedText + '.';
      }
      break;

    default:
      // Default improvement - make it more professional
      improvedText = improvedText.replace(/\bwe\b/gi, 'our team');
      improvedText = improvedText.replace(/\bI\b/g, 'We');
      improvedText = improvedText.charAt(0).toUpperCase() + improvedText.slice(1);
  }

  return improvedText;
};

// Remove Sonoma branding from AI responses
const removeSonomaBranding = (text) => {
  const brandingPatterns = [
    /Thank you for considering Sonoma, built by Oak AI\.?/gi,
    /Thank you for considering Sonoma\.?/gi,
    /built by Oak AI\.?/gi,
    /Sonoma, built by Oak AI\.?/gi,
    /Generated by Sonoma\.?/gi,
    /Powered by Sonoma\.?/gi,
    /Created by Sonoma\.?/gi,
    /Sonoma AI\.?/gi,
    /Oak AI\.?/gi
  ];
  
  let cleanedText = text;
  brandingPatterns.forEach(pattern => {
    cleanedText = cleanedText.replace(pattern, '');
  });
  
  // Clean up any extra whitespace or line breaks
  cleanedText = cleanedText.replace(/\n\s*\n/g, '\n').trim();
  
  return cleanedText;
};
