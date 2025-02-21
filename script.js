const gitID = document.getElementById("searchBox");
const subButton = document.getElementById("search");
const displayDiv = document.getElementById("displayGitProfile");
const followersDiv = document.getElementById("followersSection");
const reposDiv = document.getElementById("repositoriesSection");
const backButton = document.createElement("button");

let cachedData = {};
let currentUsername = "";

const accessToken = "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";

subButton.addEventListener("click", function (event) {
    event.preventDefault();

    const username = gitID.value.trim();
    if (username === "") {
        alert("Please enter a GitHub username.");
        return;
    }

    currentUsername = username;

    if (cachedData[username]) {
        displayUserData(cachedData[username].userData);
        displayRepositories(cachedData[username].repos);
        displayFollowers(cachedData[username].followers);
        return;
    }

    fetch(`https://api.github.com/users/${username}`, {
        headers: { Authorization: `token ${accessToken}` }
    })
        .then(response => {
            if (!response.ok) throw new Error("User not found or API rate limited.");
            return response.json();
        })
        .then(data => {
            cachedData[username] = { userData: data };
            displayUserData(data);

            return fetch(`https://api.github.com/users/${username}/repos`, {
                headers: { Authorization: `token ${accessToken}` }
            });
        })
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch repositories.");
            return response.json();
        })
        .then(repos => {
            cachedData[username].repos = repos;
            displayRepositories(repos);

            return fetch(`https://api.github.com/users/${username}/followers`, {
                headers: { Authorization: `token ${accessToken}` }
            });
        })
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch followers.");
            return response.json();
        })
        .then(followers => {
            cachedData[username].followers = followers;
            displayFollowers(followers);
        })
        .catch(error => {
            displayDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        });
});

function displayUserData(data) {
    displayDiv.innerHTML = `
        <img src="${data.avatar_url}" alt="GitHub Avatar" width="150">
        <h2>${data.name || "No Name Available"}</h2>
        <p><strong>Country:</strong> ${data.location || "Not Available"}</p>
        <p><strong>Email:</strong> ${data.email || "Not Available"}</p>
        <p><strong>GitHub Profile:</strong> <a href="${data.html_url}" target="_blank">${data.html_url}</a></p>
        <h3>Repositories:</h3>
        <div id="repositoriesList"></div>
        <h3>Followers:</h3>
        <div id="followersList"></div>
    `;

    // Ensure profile is visible and follower profile is hidden
    displayDiv.style.display = "block";
    followersDiv.style.display = "none";
}

function displayRepositories(repos) {
    const reposList = document.getElementById("repositoriesList");
    reposList.innerHTML = "";

    if (!repos || repos.length === 0) {
        reposList.innerHTML = "<p>No repositories found.</p>";
        return;
    }

    repos.forEach(repo => {
        const repoItem = document.createElement("div");
        repoItem.classList.add("repo-item");
        repoItem.innerHTML = `
            <p><strong>${repo.name}</strong>: ${repo.description || "No description available"}</p>
            <p>⭐ Stars: ${repo.stargazers_count} | 🍴 Forks: ${repo.forks_count}</p>
            <p><a href="${repo.html_url}" target="_blank">View Repository</a></p>
        `;
        reposList.appendChild(repoItem);
    });
}

function displayFollowers(followers) {
    const followersList = document.getElementById("followersList");
    followersList.innerHTML = "";

    if (!followers || followers.length === 0) {
        followersList.innerHTML = "<p>No followers found.</p>";
        return;
    }

    followers.forEach(follower => {
        const followerItem = document.createElement("div");
        followerItem.classList.add("follower-item");
        followerItem.innerHTML = `
            <img src="${follower.avatar_url}" alt="${follower.login}" width="50">
            <span>${follower.login}</span>
        `;

        followerItem.addEventListener("click", () => showFollowerDetails(follower));

        followersList.appendChild(followerItem);
    });
}

function showFollowerDetails(follower) {
    displayDiv.style.display = "none"; // Hide main profile
    followersDiv.style.display = "block"; // Show follower profile

    followersDiv.innerHTML = `
        <h2>${follower.login}</h2>
        <img src="${follower.avatar_url}" alt="Follower Avatar" width="100">
        <p><strong>Profile:</strong> <a href="${follower.html_url}" target="_blank">${follower.html_url}</a></p>
        <div id="followerDetails"></div>
    `;

    // Add back button
    backButton.textContent = "Back to Profile";
    backButton.style.display = "block";
    backButton.style.margin = "15px auto";
    backButton.style.padding = "10px 15px";
    backButton.style.border = "none";
    backButton.style.borderRadius = "5px";
    backButton.style.cursor = "pointer";
    backButton.style.backgroundColor = "#ff6b6b";
    backButton.style.color = "white";
    backButton.style.fontSize = "16px";
    backButton.addEventListener("click", () => {
        followersDiv.style.display = "none"; // Hide follower profile
        displayDiv.style.display = "block"; // Show main profile
    });

    followersDiv.appendChild(backButton);

    if (cachedData[follower.login]) {
        displayFollowerData(cachedData[follower.login]);
        return;
    }

    fetch(`https://api.github.com/users/${follower.login}`, {
        headers: { Authorization: `token ${accessToken}` }
    })
        .then(response => {
            if (!response.ok) throw new Error("Failed to fetch follower details.");
            return response.json();
        })
        .then(data => {
            cachedData[follower.login] = data;
            displayFollowerData(data);
        })
        .catch(error => {
            document.getElementById("followerDetails").innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        });
}

function displayFollowerData(data) {
    document.getElementById("followerDetails").innerHTML = `
        <p><strong>Name:</strong> ${data.name || "Not Available"}</p>
        <p><strong>Followers:</strong> ${data.followers}</p>
        <p><strong>Following:</strong> ${data.following}</p>
        <p><strong>Repositories:</strong> ${data.public_repos}</p>
        <p><strong>GitHub Profile:</strong> <a href="${data.html_url}" target="_blank">${data.html_url}</a></p>
    `;
}
