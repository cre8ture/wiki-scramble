// Get the ASCII container element from the document
const container = document.getElementById("asciiContainer");
const wikiContainer = document.getElementById("wikiArticle");
const captureBtn = document.getElementById("captureBtn");
const yourText = document.getElementById("your-text");
const holeSizeWidth = 80;
const holeSizeHeight = 80;
let allSpans;

document.getElementById('captureBtn').addEventListener('click', function() {
  html2canvas(document.getElementById('wikiArticle')).then(function(canvas) {
    // Process the canvas here
    var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
var link = document.createElement('a');
link.download = "my-image.png";
link.href = image;
link.click();
document.body.removeChild(canvas);

  });
});


// create mouse div
// Create a circular div
const circle = document.createElement('div');
circle.style.width = holeSizeWidth + 'px';
circle.style.height = holeSizeHeight + 'px';
circle.style.borderRadius = '50%';
circle.style.position = 'absolute';
circle.style.pointerEvents = 'none'; // So it doesn't interfere with mouse events
circle.style.background = 'white';
circle.style.opacity = '0.8';
document.body.appendChild(circle);


document.addEventListener('mousemove', (e) => {
  circle.style.left = e.pageX - holeSizeWidth / 2 + 'px';
  circle.style.top = e.pageY - holeSizeWidth / 2 + 'px';
  findMouseIntersections(circle.getBoundingClientRect());

})

yourText.addEventListener('change', (e) => {
  const text = e.target.value;
  transformToChars(text)
})

function findMouseIntersections(rect) {
  // Get all points along the edge of the circle
  const points = [
    { x: rect.left, y: rect.top }, // top-left
    { x: rect.right, y: rect.top }, // top-right
    { x: rect.right, y: rect.bottom }, // bottom-right
    { x: rect.left, y: rect.bottom }, // bottom-left
    { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }, // center
  ];

  // For each point, get the element at that point and log it
  // points.forEach((point) => {
  //   const elements = document.elementsFromPoint(point.x, point.y);
  //   elements.forEach((element) => {
  //     if (element.tagName === 'SPAN') {
  //       console.log(element.textContent);
  //       element.style.color = 'red';
  //       element.dataset.originalText = element.textContent;
  //     }
  //   })
  // })
  const centerX = points[4].x;
const centerY = points[4].y;
  const currSpans = []
  allSpans.forEach((span, i) => { 
    const rect = span.getBoundingClientRect();
    const closestX = Math.max(rect.left, Math.min(points[4].x, rect.right));
    const closestY = Math.max(rect.top, Math.min(points[4].y, rect.bottom));

    // Calculate the distance between this point and the center of the circle
    const dx = closestX - points[4].x;
    const dy = closestY - points[4].y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If the distance is less than the radius of the circle, then the circle and the rectangle intersect
    if (distance < holeSizeWidth / 2) {
      // console.log("Circle intersects with character " + i + ":", rect);
      currSpans.push(span)
    } else {
      span.style.color = 'black';
      span.textContent = span.dataset.originalText;
      // span.style.top = span.dataset.rect.top;
      // span.style.left = span.dataset.rect.left;
    }
  })

  if(currSpans.length > 0)   updateFrame(currSpans, centerX, centerY)

}

function cleanDiv(div){
  while(div.firstChild){
    div.removeChild(div.firstChild)
  }
}
// transform article to chars. 
// text is an array of chars
function transformToCharsSpot(child, points) {
  cleanDiv(wikiContainer)
  const parent = child.parentNode;
  parent.style.position = "relative";

  const text = child.textContent.split("");
  const circleCenter = points[0];
  const circleRadius = holeSizeWidth;

  for (let i = 0; i < text.length; i++) {
    const range = document.createRange();
    range.setStart(child, 0);
    range.setEnd(child, i + 1);

    const rect = range.getBoundingClientRect();

    // Find the closest point in the rectangle to the center of the circle
    const closestX = Math.max(rect.left, Math.min(circleCenter.x, rect.right));
    const closestY = Math.max(rect.top, Math.min(circleCenter.y, rect.bottom));

    // Calculate the distance between this point and the center of the circle
    const dx = closestX - circleCenter.x;
    const dy = closestY - circleCenter.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If the distance is less than the radius of the circle, then the circle and the rectangle intersect
    if (distance < circleRadius) {
    }
  }
}

let input = document.getElementById("topic");

let topic = "artificial intelligence";

input.addEventListener("change", (e) => {
  loading(true);

  const topic = e.target.value; // Get the value of the input field when it changes
  getWikiArticle(topic); // Call the getWiki function with the updated topic
});

let intervalId;
function loading(on) {
  if (on) {
    console.log("i am loading")
    if (intervalId) {
      clearInterval(intervalId); // This will stop the interval
    }
    intervalId = setInterval(() => {
      console.log("i am LOAD")
      wikiContainer.textContent = wikiContainer.textContent + ".";
    }, 1000);
  } else {
    console.log("i am stopping")
    clearInterval(intervalId);
    intervalId = undefined; // This will stop the interval
  }
}

// get wikipedia article
async function getWikiArticle(topic) {
  try {
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/html/${topic}`
    );
    const articleHtml = await response.text();
    await loading(false)
    // Extract the plain text from the HTML content
    const text = new DOMParser().parseFromString(articleHtml, "text/html")
      .documentElement.textContent;

    // Remove all newline characters
    const textWithoutNewlines = text.replace(/\n/g, '');


    // wikiContainer.textContent = textWithoutNewlines;
    transformToChars(textWithoutNewlines.slice(0,2500))
    // You now have the plain text content of the Wikipedia page.
  } catch (error) {
    console.error("Error fetching Wikipedia article:", error);
  }
}

// Usage example:
// getWiki("YourTopicHere");

// Define the characters used for ASCII shading
// const density = "Ñ@#W$9876543210?!abc;:+=-,._ ";
const density = "█▓▒░ "

// Set the number of rows and columns for the ASCII grid
const rows = 30;
const cols = 80;

// Loop to initialize the ASCII grid with spans and line breaks
// for (let y = 0; y < rows; y++) {
//   for (let x = 0; x < cols; x++) {
//     // Create a new span element for each ASCII character
//     const span = document.createElement("span");
//     // Append the span to the container
//     container.appendChild(span);
//   }
//   // After each row, append a line break to start a new line
//   // container.appendChild(document.createElement("br"));
// }

// transform article to chars
function transformToChars(text) {
  allSpans = []
  // const text = wikiContainer.textContent;
  for (let i = 0; i < text.length; i++) {
    const span = document.createElement("span");
    if (text[i] == " ") span.textContent = "&nbsp;";
    else span.textContent = text[i];
    span.dataset.originalText = text[i];
    allSpans.push(span)

    if (i !== 0 && i !== text.length - 1 && i % cols === 0) {
      // const br = document.createElement("br");
      // wikiArticle.appendChild(br);
    }
    wikiArticle.appendChild(span);
    span.dataset.rect = span.getBoundingClientRect();

  }
}

// Select all span elements in the container (representing each ASCII character)
const chars = container.querySelectorAll("span");

// Initialize a frame counter for animation
let frame = 0;

// Function to calculate which character to display based on x, y position and frame
// function main(x, y) {
//   // Alternating sign factor: -1 for even lines, 1 for odd lines
//   const sign = (y % 2) * 2 - 1;
//   // Calculate index in the density string based on position and frame
//   const index = (cols + y + x * sign + frame) % density.length;
//   // Return the character at the calculated index
//   return density[index];
// }

function main(char, centerX, centerY) {

  const rect = char.getBoundingClientRect();

  // Calculate the distance to the center of the div
  const dx = centerX - rect.left - rect.width / 2;
  const dy = centerY - rect.top - rect.height / 2;

    // Set the initial position of the span to its current position
    char.style.transform = 'translate(0px, 0px)';
    requestAnimationFrame(() => {
      char.style.transform = `translate(${dx}px, ${dy}px)`;
      console.log("i am animating dude!", char.style.transform )
    });
}


let currentID;
// Function to update each frame of the animation
function updateFrame(chars, centerX, centerY) {

  for (char of chars){
  main (char, centerX, centerY)}

  }

  // Increment the frame counter

  // if (frame < 5) {
  //   currentID = requestAnimationFrame(updateFrame);
  // } else {
  //   // Optionally, log that the animation has stopped
  //   cancelAnimationFrame(currentID);
  //   console.log("Stopped animation after 20 frames.");
  // }
  // Request the next frame of the animation
  // currentID = requestAnimationFrame(updateFrame);

// Start the animation
// updateFrame(chars);
getWikiArticle(topic)