// get the list of area forecast discussions from the Wilmington office
fetch('https://api.weather.gov/products/types/AFD/locations/ILN')
.then(response => response.json())

// now let's parse the JSON and get the most recent one
.then(data => {
  const mostRecentAFDUrl = data['@graph'][0]['@id'];
  fetch(mostRecentAFDUrl)
    .then(response => response.text())
    .then(text => {

      // the JSON delivers the text of the discussion in a productText key as a single long paragraph with /n line breaks. I want to clean that up and create headings that I can style.
      const productText = JSON.parse(text).productText;

      // Some NWS notes come ahead of the first Synopsis heading. I'm going to use regex to grab that.
      const [preSynopsisText, ...restText] = productText.split('SYNOPSIS');
      
       // I also want to split the text by lines starting with '&&'
      const sections = restText.join('SYNOPSIS').split(/\n(?=&&)/);
      
      // Create the HTML containers
      const container = document.getElementById('afd-text');
      const header = document.getElementById('header');
      
      // Add pre-synopsis text as a paragraph so I can later remove it
      const preSynopsisParagraph = document.createElement('p');
      preSynopsisParagraph.classList.add('pre-synopsis')
      preSynopsisParagraph.textContent = preSynopsisText.trim();
      header.appendChild(preSynopsisParagraph);
      
      // Add Synopsis as the first heading
      const synopsisHeading = document.createElement('h2');
      synopsisHeading.textContent = 'SYNOPSIS';
      container.appendChild(synopsisHeading);

      for (let section of sections) {
        const match = /&&\s*\.?(.+?)\.\.\./.exec(section); // extract text between '&&' (with optional '.') and '...'
        if (match) {
          const heading = document.createElement('h2');
          heading.textContent = match[1].trim(); // use the extracted text as the heading
          container.appendChild(heading);
          section = section.replace(/&&\s*\.?.+?\.\.\./, '').trim(); // remove the heading part from the section
        }
        const content = document.createElement('p');
        content.textContent = section.trim();
        container.appendChild(content);
      }

      // Get the issuance time value from the JSON
        const forecastTime = JSON.parse(text).issuanceTime;

      // Convert time to Eastern
        const easternTime = new Date(forecastTime).toLocaleString('en-US', { timeZone: 'America/New_York' });

      // Wrap the time in a paragraph
        const timeParagraph = document.createElement('p');

      // Add a class for styling
        timeParagraph.classList.add('time');

      // Write the time
        timeParagraph.textContent = `Area forecast discussion issued at ${easternTime}.`;

      // Append to the header element
        header.appendChild(timeParagraph);
    });
});