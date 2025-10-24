"""
Backend script to fetch GitHub repositories
This can be used with Flask/FastAPI to create an API endpoint
"""

import requests
from typing import List, Dict, Optional
from datetime import datetime
import json

class GitHubRepoFetcher:
    def __init__(self, username: str, token: Optional[str] = None):
        """
        Initialize GitHub Repository Fetcher
        
        Args:
            username: GitHub username
            token: Optional GitHub Personal Access Token for higher rate limits
        """
        self.username = username
        self.token = token
        self.base_url = "https://api.github.com"
        self.headers = {
            "Accept": "application/vnd.github.v3+json"
        }
        
        if token:
            self.headers["Authorization"] = f"token {token}"
    
    def fetch_repositories(self, 
                          visibility: str = "all",
                          sort: str = "updated",
                          per_page: int = 100) -> List[Dict]:
        """
        Fetch repositories from GitHub
        
        Args:
            visibility: 'all', 'public', or 'private'
            sort: Sort by 'created', 'updated', 'pushed', 'full_name'
            per_page: Number of results per page (max 100)
        
        Returns:
            List of repository dictionaries
        """
        url = f"{self.base_url}/users/{self.username}/repos"
        
        params = {
            "type": visibility,
            "sort": sort,
            "per_page": per_page
        }
        
        try:
            response = requests.get(url, headers=self.headers, params=params)
            response.raise_for_status()
            
            repos = response.json()
            return self._format_repositories(repos)
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching repositories: {e}")
            return []
    
    def _format_repositories(self, repos: List[Dict]) -> List[Dict]:
        """Format repository data for frontend consumption"""
        formatted_repos = []
        
        for repo in repos:
            formatted_repo = {
                "id": repo["id"],
                "name": repo["name"],
                "description": repo["description"],
                "url": repo["html_url"],
                "homepage": repo["homepage"],
                "language": repo["language"],
                "stars": repo["stargazers_count"],
                "forks": repo["forks_count"],
                "watchers": repo["watchers_count"],
                "open_issues": repo["open_issues_count"],
                "topics": repo["topics"],
                "private": repo["private"],
                "created_at": repo["created_at"],
                "updated_at": repo["updated_at"],
                "pushed_at": repo["pushed_at"],
                "size": repo["size"],
                "license": repo["license"]["name"] if repo["license"] else None
            }
            formatted_repos.append(formatted_repo)
        
        return formatted_repos
    
    def filter_repositories(self, 
                           repos: List[Dict], 
                           language: Optional[str] = None,
                           min_stars: int = 0,
                           has_topics: bool = False) -> List[Dict]:
        """
        Filter repositories based on criteria
        
        Args:
            repos: List of repositories
            language: Filter by programming language
            min_stars: Minimum number of stars
            has_topics: Only include repos with topics
        
        Returns:
            Filtered list of repositories
        """
        filtered = repos
        
        if language:
            filtered = [r for r in filtered if r["language"] == language]
        
        if min_stars > 0:
            filtered = [r for r in filtered if r["stars"] >= min_stars]
        
        if has_topics:
            filtered = [r for r in filtered if r["topics"]]
        
        return filtered
    
    def get_repository_stats(self, repos: List[Dict]) -> Dict:
        """
        Get statistics about repositories
        
        Returns:
            Dictionary with statistics
        """
        if not repos:
            return {}
        
        languages = {}
        total_stars = 0
        total_forks = 0
        
        for repo in repos:
            # Count languages
            lang = repo["language"]
            if lang:
                languages[lang] = languages.get(lang, 0) + 1
            
            # Sum stars and forks
            total_stars += repo["stars"]
            total_forks += repo["forks"]
        
        return {
            "total_repos": len(repos),
            "public_repos": len([r for r in repos if not r["private"]]),
            "private_repos": len([r for r in repos if r["private"]]),
            "total_stars": total_stars,
            "total_forks": total_forks,
            "languages": languages,
            "most_starred": max(repos, key=lambda x: x["stars"]) if repos else None,
            "most_recent": max(repos, key=lambda x: x["updated_at"]) if repos else None
        }


# Flask API Example
"""
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Initialize fetcher
fetcher = GitHubRepoFetcher(
    username="YOUR_GITHUB_USERNAME",
    token="YOUR_GITHUB_TOKEN"  # Optional
)

@app.route('/api/repositories', methods=['GET'])
def get_repositories():
    visibility = request.args.get('visibility', 'all')
    sort = request.args.get('sort', 'updated')
    
    repos = fetcher.fetch_repositories(visibility=visibility, sort=sort)
    return jsonify(repos)

@app.route('/api/repositories/stats', methods=['GET'])
def get_stats():
    repos = fetcher.fetch_repositories()
    stats = fetcher.get_repository_stats(repos)
    return jsonify(stats)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
"""


# FastAPI Example
"""
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize fetcher
fetcher = GitHubRepoFetcher(
    username="YOUR_GITHUB_USERNAME",
    token="YOUR_GITHUB_TOKEN"  # Optional
)

@app.get("/api/repositories")
async def get_repositories(
    visibility: str = Query("all", regex="^(all|public|private)$"),
    sort: str = Query("updated", regex="^(created|updated|pushed|full_name)$")
):
    repos = fetcher.fetch_repositories(visibility=visibility, sort=sort)
    return repos

@app.get("/api/repositories/stats")
async def get_stats():
    repos = fetcher.fetch_repositories()
    stats = fetcher.get_repository_stats(repos)
    return stats

# Run with: uvicorn github_api:app --reload
"""


# Command-line usage example
if __name__ == "__main__":
    # Example usage
    fetcher = GitHubRepoFetcher(
        username="kartikbhai23",
        token=None  # Add your token here for higher rate limits
    )
    
    # Fetch all repositories
    repos = fetcher.fetch_repositories(visibility="all", sort="updated")
    
    # Print summary
    print(f"Found {len(repos)} repositories")
    
    # Get statistics
    stats = fetcher.get_repository_stats(repos)
    print(f"\nStatistics:")
    print(f"Public repos: {stats['public_repos']}")
    print(f"Private repos: {stats['private_repos']}")
    print(f"Total stars: {stats['total_stars']}")
    print(f"Total forks: {stats['total_forks']}")
    print(f"\nLanguages: {stats['languages']}")
    
    # Save to JSON file
    with open('repositories.json', 'w') as f:
        json.dump(repos, f, indent=2)
    
    print("\nRepositories saved to repositories.json")