const formSections = document.querySelectorAll('.form-section');
let draggedElement = null;
let initialOrder = [];

// Save the initial order of form sections
function saveInitialOrder() {
  initialOrder = Array.from(formSections).map(section => section.id);
}

// Handle drag and drop events
formSections.forEach(section => {
  section.addEventListener('dragstart', () => {
    draggedElement = section;
    setTimeout(() => { section.style.display = 'none'; }, 0);
  });

  section.addEventListener('dragend', () => {
    setTimeout(() => {
      draggedElement.style.display = 'block';
      draggedElement = null;
    }, 0);
  });

  section.addEventListener('dragover', event => {
    event.preventDefault();
  });

  section.addEventListener('drop', event => {
    event.preventDefault();
    if (section !== draggedElement) {
      const form = document.getElementById('resumeForm');
      form.insertBefore(draggedElement, section);
      saveCurrentOrder();
    }
  });
});

// Save the current order to local storage
function saveCurrentOrder() {
  const currentOrder = Array.from(formSections).map(section => section.id);
  localStorage.setItem('sectionOrder', JSON.stringify(currentOrder));
}

// Restore the order from local storage
function restoreOrder(order) {
  const form = document.getElementById('resumeForm');
  order.forEach(sectionId => {
    const section = document.getElementById(sectionId);
    form.appendChild(section);
  });
}

// Undo button
document.getElementById('undoBtn').addEventListener('click', () => {
  restoreOrder(initialOrder);
  localStorage.removeItem('sectionOrder');
});

// Form submission to generate resume preview
document.getElementById("resumeForm").addEventListener("submit", function (event) {
  event.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const skills = document.getElementById("skills").value.split(",").map(skill => skill.trim());
  const experience = document.getElementById("experience").value;
  const education = document.getElementById("education").value;
  const projects = document.getElementById("projects").value;
  const certifications = document.getElementById("certifications").value.split(",").map(cert => cert.trim());
  const languages = document.getElementById("languages").value.split(",").map(lang => lang.trim());

  const resumeHTML = `
    <div class="resume-section">
      <h2>${name}</h2>
      <p>Email: ${email}</p>
      <p>Phone: ${phone}</p>
    </div>
    <div class="resume-section">
      <h2>Skills</h2>
      <ul>${skills.map(skill => `<li>${skill}</li>`).join('')}</ul>
    </div>
    <div class="resume-section">
      <h2>Experience</h2>
      <p>${experience}</p>
    </div>
    <div class="resume-section">
      <h2>Education</h2>
      <p>${education}</p>
    </div>
    <div class="resume-section">
      <h2>Projects</h2>
      <p>${projects}</p>
    </div>
    <div class="resume-section">
      <h2>Certifications</h2>
      <ul>${certifications.map(cert => `<li>${cert}</li>`).join('')}</ul>
    </div>
    <div class="resume-section">
      <h2>Languages</h2>
      <ul>${languages.map(lang => `<li>${lang}</li>`).join('')}</ul>
    </div>
  `;

  document.getElementById("resumePreview").innerHTML = resumeHTML;
  document.getElementById("downloadBtn").style.display = "block";
});

document.getElementById("downloadBtn").addEventListener("click", function () {
  const resume = document.getElementById("resumePreview");

  if (!resume) {
    console.error("Element with ID 'resumePreview' not found!");
    alert("Resume preview section is missing.");
    return;
  }

  // Importing html2canvas and jsPDF 
  html2canvas(resume, {
    scale: 2,  
    useCORS: true,
    logging: true
  }).then(canvas => {
    console.log("Canvas successfully created!");

    const imgData = canvas.toDataURL("image/png");
    const { jsPDF } = window.jspdf; 
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210; 
    const pageHeight = 297; 
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Adding first page of the image
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Adding pages if the content overflows
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("resume.pdf");

  }).catch(err => {
    console.error("Error generating the PDF:", err);
    alert("An error occurred while generating the PDF. Please check the console for more details.");
  });
});
