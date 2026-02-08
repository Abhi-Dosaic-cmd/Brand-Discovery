/**
 * Google Apps Script to automatically generate the REFINED Brand Discovery Google Form.
 * TO USE:
 * 1. Go to script.google.com
 * 2. Click "New Project"
 * 3. Paste this code and click "Run" (button with triangle)
 * 4. Check your Google Drive for the new file!
 */

function createBrandDiscoveryForm() {
  const formName = "Brand Discovery: Video/Audio Chat Platform";
  const form = FormApp.create(formName);
  
  form.setTitle(formName)
      .setDescription("Hi! This form will help us understand your platform better so we can create a brand that truly represents what you're building. There are no wrong answers—just share what feels right to you. Examples are provided to guide you.")
      .setConfirmationMessage("Thank you! 🎉 Your answers will help us create a brand that truly represents your platform. We'll review everything and get back to you soon with ideas and options.");

  // Section 1: Basics
  form.addSectionHeaderItem().setTitle("Step 1: Let's Start with the Basics");
  
  form.addTextItem().setTitle("1. What is the name of your platform?")
    .setHelpText("If you don't have a final name yet, just share your working name or project name.")
    .setRequired(true);

  form.addParagraphTextItem().setTitle("2. In simple words, what is your platform?")
    .setHelpText("Example: 'A video chat app where small groups can hang out and talk casually' or 'An audio-only platform for study groups and co-working sessions'")
    .setRequired(true);

  form.addMultipleChoiceItem().setTitle("3. What stage is your platform currently in?")
    .setChoices([
      form.newChoice("Just an idea"),
      form.newChoice("Building it now (in development)"),
      form.newChoice("Testing with early users (beta)"),
      form.newChoice("Live and available to everyone"),
    ])
    .showOtherOption(true)
    .setRequired(true);

  // Section 2: Audience
  form.addPageBreakItem().setTitle("Step 2: Who Is This For?");

  form.addCheckboxItem().setTitle("4. Who will use your platform the most?")
    .setChoices([
      form.newChoice("Students (high school or college)"),
      form.newChoice("Working professionals"),
      form.newChoice("Friend groups"),
      form.newChoice("Online communities"),
      form.newChoice("Content creators"),
      form.newChoice("Freelancers / remote workers"),
      form.newChoice("Hobbyists and interest groups")
    ])
    .showOtherOption(true)
    .setRequired(true);

  form.addMultipleChoiceItem().setTitle("5. What age group are your main users?")
    .setChoices([
      form.newChoice("Under 18"),
      form.newChoice("18-24"),
      form.newChoice("25-34"),
      form.newChoice("35-44"),
      form.newChoice("45+"),
      form.newChoice("All ages")
    ])
    .setRequired(true);

  // Section 3: Personality
  form.addPageBreakItem().setTitle("Step 3: Brand Personality");
  
  form.addCheckboxItem().setTitle("6. How should your brand feel? (Select the words that fit best)")
    .setChoices([
      form.newChoice("Friendly"),
      form.newChoice("Professional"),
      form.newChoice("Serious and focused"),
      form.newChoice("Calm and relaxing"),
      form.newChoice("Energetic and bold"),
      form.newChoice("Warm and welcoming"),
      form.newChoice("Safe and trustworthy")
    ])
    .setRequired(true);

  const scales = [
    { title: "7.1 Friendly and casual vs Professional and polished", left: "Friendly/Casual", right: "Professional" },
    { title: "7.2 Fun and playful vs Serious and focused", left: "Fun/Playful", right: "Serious" },
    { title: "7.3 Bold and loud vs Calm and gentle", left: "Bold/Loud", right: "Calm" },
    { title: "7.4 Simple and minimal vs Rich and detailed", left: "Simple/Minimal", right: "Rich/Detailed" },
    { title: "7.5 Young and fresh vs Mature and established", left: "Young/Fresh", right: "Mature" }
  ];

  scales.forEach(s => {
    form.addScaleItem().setTitle(s.title)
        .setBounds(1, 5)
        .setLabels(s.left, s.right)
        .setRequired(true);
  });

  // Section 4: Brand Voice
  form.addPageBreakItem().setTitle("Step 4: Brand Voice");
  form.addParagraphTextItem().setTitle("8. Are there any words or tone you want to AVOID?")
    .setHelpText("Example: 'No corporate jargon or technical terms' or 'Nothing too cutesy or childish'");

  // Section 5: Look & Feel
  form.addPageBreakItem().setTitle("Step 5: Look & Feel Preferences");
  
  form.addParagraphTextItem().setTitle("9. Do you have any color preferences?")
    .setHelpText("Example: 'Blues and purples feel calming' or 'Bright, warm colors like orange and yellow'");

  form.addMultipleChoiceItem().setTitle("10. What kind of visual mood appeals to you?")
    .setChoices([
      form.newChoice("Light and bright"),
      form.newChoice("Dark and modern"),
      form.newChoice("Colorful and vibrant"),
      form.newChoice("Minimal and clean")
    ])
    .setRequired(true);

  form.addParagraphTextItem().setTitle("11. Are there any brands (apps, products, websites) whose look you really like?")
    .setHelpText("Example: 'I love how Spotify looks—clean and modern' or 'Notion's simplicity'");

  // Section 6: User Feelings
  form.addPageBreakItem().setTitle("Step 6: Desired User Experience");
  form.addCheckboxItem().setTitle("12. How should users feel when using your platform?")
    .setChoices([
      form.newChoice("Safe and private"),
      form.newChoice("Relaxed and comfortable"),
      form.newChoice("Energized and engaged"),
      form.newChoice("Connected to others"),
      form.newChoice("Free to be themselves"),
      form.newChoice("Productive and focused"),
      form.newChoice("Entertained and happy")
    ])
    .showOtherOption(true)
    .setRequired(true);

  // Section 7: Essence
  form.addPageBreakItem().setTitle("Step 7: One-Line Brand Summary");
  form.addParagraphTextItem().setTitle("13. Complete this sentence: 'Our platform is like ______ for people who want ______.'")
    .setRequired(true);

  // Final Section
  form.addParagraphTextItem().setTitle("14. Is there anything else you'd like us to know about your vision or brand?");

  // Link to Sheet
  const spreadsheet = SpreadsheetApp.create(formName + " (Responses)");
  form.setDestination(FormApp.DestinationType.SPREADSHEET, spreadsheet.getId());

  Logger.log('Form created! Edit URL: ' + form.getEditUrl());
  Logger.log('Spreadsheet URL: ' + spreadsheet.getUrl());
}
