// Code by Kalash Satyapal

// Array of API Keys
const API_KEYS = [
    'Enter_Your_First_Youtube_API_Key',
    'Enter_Your_Second_Youtube_API_Key',
    'Enter_Your_Third_Youtube_API_Key'
];

let currentKeyIndex = 0;
const API_URL = 'https://www.googleapis.com/youtube/v3/search';

// DOM Elements
const menuIcon = document.getElementById('menu-icon');
const sidebar = document.getElementById('sidebar');
const content = document.getElementById('content');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const videoContainer = document.getElementById('video-container');
const sidebarMenuIcon = document.getElementById('sidebar-menu-icon');
const body = document.body;

// Code to Initialize Dark Mode from localStorage
if (localStorage.getItem('darkMode') === 'enabled') {
    body.classList.add('dark-mode');
    darkModeToggle.textContent = '🌞'; // Switch to light mode
} else {
    darkModeToggle.textContent = '🌙'; // Switch to dark mode
}

// logic code to Toggle Sidebar Visibility
menuIcon.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    content.classList.toggle('shifted');
});

sidebarMenuIcon.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    content.classList.toggle('shifted');
});

// Toggle Dark Mode
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        darkModeToggle.textContent = '🌞';
        localStorage.setItem('darkMode', 'enabled');
    } else {
        darkModeToggle.textContent = '🌙';
        localStorage.setItem('darkMode', 'disabled');
    }
});

// to Fetch Random Videos on Page Load
document.addEventListener('DOMContentLoaded', fetchRandomVideos);

// Function to Get Current API Key
function getApiKey() {
    return API_KEYS[currentKeyIndex];
}

// Function to Switch to Next API Key
function switchApiKey() {
    if (currentKeyIndex < API_KEYS.length - 1) {
        currentKeyIndex++;
        console.warn(`Switching to next API key: ${getApiKey()}`);
    } else {
        console.error('All API keys have reached their quota.');
    }
}

// Function to Fetch Random Videos on Page Load
function fetchRandomVideos() {
    const randomQueries = ['random', 'funny', 'music', 'comedy', 'sports', 'news', 'travel', 'tech', 'gaming', 'vlog'];
    let videoItems = [];

    const fetchPromises = randomQueries.map(query => {
        const url = `${API_URL}?part=snippet&q=${query}&type=video&key=${getApiKey()}&maxResults=10`;
        return fetchWithRetry(url)
            .then(data => {
                if (data.items) {
                    videoItems = videoItems.concat(data.items);
                }
            });
    });

    Promise.all(fetchPromises)
        .then(() => {
            displayVideos(videoItems.slice(0, 100));
        })
        .catch(error => console.error('Error fetching random videos:', error));
}

// Function to Fetch videos with API Key Switching on Quota Exceeded
function fetchWithRetry(originalUrl) {
    const tryFetch = (url) => {
        console.log(`Fetching with API key: ${getApiKey()}`); 
        return fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.error && data.error.code === 403) { 
                    console.warn('API quota exceeded for key:', getApiKey());

                    if (currentKeyIndex < API_KEYS.length - 1) {
                        switchApiKey();
                        
                        // Generate a new URL with the updated API key
                        const newUrl = originalUrl.replace(/key=[^&]+/, `key=${getApiKey()}`);
                        console.log(`Retrying with new API key: ${getApiKey()}`);

                        return tryFetch(newUrl);
                    } else {
                        console.error('All API keys have reached their quota. No more retries.');
                        return null;
                    }
                } else {
                    // Display videos only if data is valid
                    displayVideos(data.items);
                    return data;
                }
            })
            .catch(error => console.error('Error fetching videos:', error));
    };

    return tryFetch(originalUrl);
}

// Function to Display Videos
function displayVideos(videos) {
    videoContainer.innerHTML = '';

    videos.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.classList.add('video-card');
        videoCard.setAttribute('data-video-id', video.id.videoId);

        const thumbnail = document.createElement('img');
        thumbnail.src = video.snippet.thumbnails.high.url;
        thumbnail.alt = video.snippet.title;
        videoCard.appendChild(thumbnail);

        const title = document.createElement('h3');
        title.textContent = video.snippet.title;
        videoCard.appendChild(title);

        videoContainer.appendChild(videoCard);
    });
}
