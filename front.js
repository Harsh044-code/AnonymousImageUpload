const form = document.querySelector('form');
const fileInput = document.querySelector('input[type="file"]');
const codeInput = document.querySelector('input[type="text"]');
const submitButton = document.querySelector('button[type="submit"]');

// Handle file upload form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            alert(`Your file was uploaded successfully. Your code is: ${data.code}`);
        } else {
            alert('There was an error uploading your file. Please try again.');
        }
    } catch (err) {
        alert('There was an error uploading your file. Please try again.');
        console.error(err);
    }
});

// Handle file retrieval form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const code = codeInput.value;

    try {
        const response = await fetch(`/retrieve/${code}`);

        if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            window.open(url);
        } else {
            alert('There was an error retrieving your file. Please check your code and try again.');
        }
    } catch (err) {
        alert('There was an error retrieving your file. Please try again.');
        console.error(err);
    }
});
