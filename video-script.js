// Enhanced Video Management System
class VideoManager {
    constructor() {
        this.videos = JSON.parse(localStorage.getItem('shyred_videos') || '[]');
        this.currentSort = 'newest';
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.selectedVideos = new Set();
        this.editingVideoId = null;
        this.defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9InVybCgjZ3JhZGllbnQwX2xpbmVhcl8xXzEpIi8+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMTUiIHI9IjYiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuOCIvPgo8cGF0aCBkPSJNMzAgMzBDMzAgMjUuNTgyOCAyNi40MTgzIDIyIDIyIDIySDEyQzcuNTgxNzIgMjIgNCAyNS41ODI4IDQgMzBWMzBIMzBaIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjgiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQwX2xpbmVhcl8xXzEiIHgxPSIwIiB5MT0iMCIgeDI9IjQwIiB5Mj0iNDAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iI0I0NDdFQiIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMyQjZDRUUiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K';
        this.videoCache = new Map(); // Cache for blob URLs
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderVideos();
        this.updateVideoCount();
        this.initParticles();
        this.cleanupOldVideos(); // Cleanup on init
    }

    cleanupOldVideos() {
        // Clean up old blob URLs to prevent memory leaks
        this.videos.forEach(video => {
            if (video.videoUrl && video.videoUrl.startsWith('blob:')) {
                URL.revokeObjectURL(video.videoUrl);
            }
        });
    }

    setupEventListeners() {
        // Upload form toggles
        const showVideoFormBtn = document.getElementById('showVideoForm');
        if (showVideoFormBtn) {
            showVideoFormBtn.addEventListener('click', () => {
                this.showVideoForm();
            });
        }

        const showImageFormBtn = document.getElementById('showImageForm');
        if (showImageFormBtn) {
            showImageFormBtn.addEventListener('click', () => {
                this.showImageForm();
            });
        }

        const cancelVideoUploadBtn = document.getElementById('cancelVideoUpload');
        if (cancelVideoUploadBtn) {
            cancelVideoUploadBtn.addEventListener('click', () => {
                this.hideUploadForms();
            });
        }

        const cancelImageUploadBtn = document.getElementById('cancelImageUpload');
        if (cancelImageUploadBtn) {
            cancelImageUploadBtn.addEventListener('click', () => {
                this.hideUploadForms();
            });
        }

        // Form submissions
        const videoForm = document.getElementById('videoForm');
        if (videoForm) {
            videoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleVideoUpload();
            });
        }

        const imageForm = document.getElementById('imageForm');
        if (imageForm) {
            imageForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleImageUpload();
            });
        }

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.renderVideos();
            });
        }

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilter(e.target.dataset.filter);
            });
        });

        // File input styling
        this.setupFileInputs();

        // Sort buttons
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleSort(e.target.dataset.sort);
            });
        });

        // Modal controls
        const closeModalBtn = document.getElementById('closeModal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                this.closeVideoModal();
            });
        }

        const videoModal = document.getElementById('videoModal');
        if (videoModal) {
            videoModal.addEventListener('click', (e) => {
                if (e.target.id === 'videoModal') {
                    this.closeVideoModal();
                }
            });
        }

        // Edit modal controls
        const closeEditModalBtn = document.getElementById('closeEditModal');
        if (closeEditModalBtn) {
            closeEditModalBtn.addEventListener('click', () => {
                this.closeEditModal();
            });
        }

        const cancelEditBtn = document.getElementById('cancelEdit');
        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => {
                this.closeEditModal();
            });
        }

        const editVideoForm = document.getElementById('editVideoForm');
        if (editVideoForm) {
            editVideoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleVideoEdit();
            });
        }

        // Confirmation dialog
        const confirmActionBtn = document.getElementById('confirmAction');
        if (confirmActionBtn) {
            confirmActionBtn.addEventListener('click', () => {
                this.executeConfirmedAction();
            });
        }

        const cancelActionBtn = document.getElementById('cancelAction');
        if (cancelActionBtn) {
            cancelActionBtn.addEventListener('click', () => {
                this.closeConfirmationDialog();
            });
        }

        // Bulk actions
        const bulkFavoriteBtn = document.getElementById('bulkFavorite');
        if (bulkFavoriteBtn) {
            bulkFavoriteBtn.addEventListener('click', () => {
                this.bulkFavorite(true);
            });
        }

        const bulkUnfavoriteBtn = document.getElementById('bulkUnfavorite');
        if (bulkUnfavoriteBtn) {
            bulkUnfavoriteBtn.addEventListener('click', () => {
                this.bulkFavorite(false);
            });
        }

        const bulkDeleteBtn = document.getElementById('bulkDelete');
        if (bulkDeleteBtn) {
            bulkDeleteBtn.addEventListener('click', () => {
                this.bulkDelete();
            });
        }

        const cancelBulkBtn = document.getElementById('cancelBulk');
        if (cancelBulkBtn) {
            cancelBulkBtn.addEventListener('click', () => {
                this.cancelBulkSelection();
            });
        }

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.video-card-menu')) {
                this.closeAllDropdowns();
            }
        });
    }

    setupFileInputs() {
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            const customInput = input.nextElementSibling;
            if (!customInput) return;
            
            const fileText = customInput.querySelector('.file-text');
            const fileBtn = customInput.querySelector('.file-btn');

            // Remove existing listeners to prevent duplicates
            customInput.removeEventListener('click', this.handleFileInputClick);
            input.removeEventListener('change', this.handleFileInputChange);

            customInput.addEventListener('click', () => {
                input.click();
            });

            input.addEventListener('change', () => {
                if (input.files.length > 0) {
                    fileText.textContent = input.files[0].name;
                    fileText.style.color = 'var(--cyber-glow)';
                } else {
                    if (input.id === 'videoFile') {
                        fileText.textContent = 'Choose video file...';
                    } else if (input.id === 'userAvatar') {
                        fileText.textContent = 'Choose avatar image...';
                    } else if (input.id === 'editUserAvatar') {
                        fileText.textContent = 'Choose new avatar image...';
                    }
                    fileText.style.color = '#9ca3af';
                }
            });
        });
    }

    showVideoForm() {
        this.hideUploadForms();
        const form = document.getElementById('videoUploadForm');
        if (form) {
            form.style.display = 'block';
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    showImageForm() {
        this.hideUploadForms();
        const form = document.getElementById('imageUploadForm');
        if (form) {
            form.style.display = 'block';
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    hideUploadForms() {
        const videoForm = document.getElementById('videoUploadForm');
        const imageForm = document.getElementById('imageUploadForm');

        if (videoForm) {
            videoForm.style.display = 'none';
            document.getElementById('videoForm')?.reset();
        }
        if (imageForm) {
            imageForm.style.display = 'none';
            document.getElementById('imageForm')?.reset();
        }
        this.resetFileInputTexts();
    }

    resetFileInputTexts() {
        document.querySelectorAll('.file-text').forEach(text => {
            const input = text.parentElement?.previousElementSibling;
            if (!input) return;

            if (input.id === 'videoFile') {
                text.textContent = 'Choose video file...';
            } else if (input.id === 'imageFile') {
                text.textContent = 'Choose image file...';
            } else if (input.id === 'editUserAvatar') {
                text.textContent = 'Choose new avatar image...';
            }
            text.style.color = '#9ca3af';
        });
    }

    async handleVideoUpload() {
        const videoFile = document.getElementById('videoFile')?.files[0];
        const title = document.getElementById('videoTitle')?.value;
        const description = document.getElementById('videoDescription')?.value || '';

        if (!videoFile || !title) {
            this.showNotification('Please select a video file and enter a title.', 'error');
            return;
        }

        // Check file size (max 100MB)
        if (videoFile.size > 100 * 1024 * 1024) {
            this.showNotification('Video file is too large. Maximum size is 100MB.', 'error');
            return;
        }

        // Show loading notification
        this.showNotification('Uploading video...', 'info');

        try {
            // Get current user avatar
            const currentUser = JSON.parse(localStorage.getItem('shyred_current_user') || 'null');
            const avatarUrl = currentUser?.avatar || this.defaultAvatar;

            // Get video duration and create blob URL
            const duration = await this.getVideoDuration(videoFile);
            const videoUrl = URL.createObjectURL(videoFile);

            // Create video object - store minimal data
            const video = {
                id: Date.now(),
                title: title.trim(),
                description: description.trim(),
                avatarUrl: avatarUrl,
                uploadDate: new Date().toISOString(),
                fileName: videoFile.name,
                fileSize: videoFile.size,
                duration: duration,
                favorite: false,
                views: 0,
                fileType: videoFile.type,
                mediaType: 'video',
                uploadedBy: currentUser?.id || 'unknown',
                username: currentUser?.username || 'Unknown User',
                likes: 0,
                comments: [],
                shares: 0
            };

            // For large files, store as blob URL (temporary)
            // For small files, store as base64 (persistent)
            if (videoFile.size < 10 * 1024 * 1024) { // 10MB threshold
                video.videoData = await this.fileToBase64(videoFile);
                video.storageType = 'base64';
            } else {
                video.videoUrl = videoUrl;
                video.storageType = 'blob';
                this.videoCache.set(video.id, videoFile);
            }

            // Add to videos array
            this.videos.push(video);
            this.saveVideos();
            this.saveToUserProfile(video);
            this.renderVideos();
            this.updateVideoCount();
            this.hideUploadForms();

            // Show success message
            this.showNotification('Video uploaded successfully!', 'success');

        } catch (error) {
            console.error('Error uploading video:', error);
            this.showNotification('Failed to upload video. Please try again.', 'error');
        }
    }

    async handleImageUpload() {
        const imageFile = document.getElementById('imageFile')?.files[0];
        const title = document.getElementById('imageTitle')?.value;
        const description = document.getElementById('imageDescription')?.value || '';

        if (!imageFile || !title) {
            this.showNotification('Please select an image file and enter a title.', 'error');
            return;
        }

        // Check file size (max 10MB)
        if (imageFile.size > 10 * 1024 * 1024) {
            this.showNotification('Image file is too large. Maximum size is 10MB.', 'error');
            return;
        }

        // Show loading notification
        this.showNotification('Uploading image...', 'info');

        try {
            // Get current user avatar
            const currentUser = JSON.parse(localStorage.getItem('shyred_current_user') || 'null');
            const avatarUrl = currentUser?.avatar || this.defaultAvatar;

            // Convert image to base64
            const imageData = await this.fileToBase64(imageFile);

            // Create image object
            const image = {
                id: Date.now(),
                title: title.trim(),
                description: description.trim(),
                avatarUrl: avatarUrl,
                uploadDate: new Date().toISOString(),
                fileName: imageFile.name,
                fileSize: imageFile.size,
                favorite: false,
                views: 0,
                fileType: imageFile.type,
                mediaType: 'image',
                uploadedBy: currentUser?.id || 'unknown',
                username: currentUser?.username || 'Unknown User',
                imageData: imageData,
                likes: 0,
                comments: [],
                shares: 0
            };

            // Add to videos array (treating images as media)
            this.videos.push(image);
            this.saveVideos();
            this.saveToUserProfile(image);
            this.renderVideos();
            this.updateVideoCount();
            this.hideUploadForms();

            // Show success message
            this.showNotification('Image uploaded successfully!', 'success');

        } catch (error) {
            console.error('Error uploading image:', error);
            this.showNotification('Failed to upload image. Please try again.', 'error');
        }
    }

    saveToUserProfile(media) {
        try {
            // Save to user's profile
            const currentUser = JSON.parse(localStorage.getItem('shyred_current_user') || 'null');
            if (currentUser) {
                if (!currentUser.uploads) {
                    currentUser.uploads = [];
                }
                currentUser.uploads.push({
                    id: media.id,
                    title: media.title,
                    description: media.description,
                    mediaType: media.mediaType,
                    uploadDate: media.uploadDate,
                    likes: media.likes || 0,
                    comments: media.comments || [],
                    shares: media.shares || 0,
                    saved: false
                });

                localStorage.setItem('shyred_current_user', JSON.stringify(currentUser));

                // Update users array
                const users = JSON.parse(localStorage.getItem('shyred_users') || '[]');
                const userIndex = users.findIndex(u => u.id === currentUser.id);
                if (userIndex !== -1) {
                    users[userIndex] = currentUser;
                    localStorage.setItem('shyred_users', JSON.stringify(users));
                }
            }
        } catch (error) {
            console.error('Error saving to user profile:', error);
        }
    }

    getVideoDuration(file) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            
            video.onloadedmetadata = function() {
                resolve(video.duration || 0);
                URL.revokeObjectURL(video.src);
            };
            
            video.onerror = function() {
                resolve(0); // Default duration if error
                URL.revokeObjectURL(video.src);
            };
            
            video.src = URL.createObjectURL(file);
        });
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    saveVideos() {
        // Only save essential data, not blob URLs
        const videosToSave = this.videos.map(video => {
            const videoData = { ...video };
            if (videoData.storageType === 'blob') {
                delete videoData.videoUrl; // Don't save blob URLs
            }
            return videoData;
        });
        
        try {
            localStorage.setItem('shyred_videos', JSON.stringify(videosToSave));
        } catch (error) {
            console.error('Failed to save videos:', error);
            this.showNotification('Storage full. Please delete some videos.', 'error');
        }
    }

    getVideoSrc(video) {
        if (video.storageType === 'base64' && video.videoData) {
            return video.videoData;
        } else if (video.storageType === 'blob' && video.videoUrl) {
            return video.videoUrl;
        } else if (this.videoCache.has(video.id)) {
            // Recreate blob URL from cached file
            const file = this.videoCache.get(video.id);
            const url = URL.createObjectURL(file);
            video.videoUrl = url;
            return url;
        }
        return null;
    }

    handleSort(sortType) {
        this.currentSort = sortType;
        
        // Update active sort button
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-sort="${sortType}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        this.renderVideos();
    }

    handleFilter(filterType) {
        this.currentFilter = filterType;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-filter="${filterType}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        this.renderVideos();
    }

    getFilteredAndSortedVideos() {
        let filteredVideos = [...this.videos];

        // Apply search filter
        if (this.searchQuery) {
            filteredVideos = filteredVideos.filter(video => 
                video.title.toLowerCase().includes(this.searchQuery) ||
                (video.description && video.description.toLowerCase().includes(this.searchQuery))
            );
        }

        // Apply category filter
        if (this.currentFilter === 'favorites') {
            filteredVideos = filteredVideos.filter(video => video.favorite);
        }

        // Apply sorting
        filteredVideos.sort((a, b) => {
            const dateA = new Date(a.uploadDate);
            const dateB = new Date(b.uploadDate);
            
            switch (this.currentSort) {
                case 'newest':
                    return dateB - dateA;
                case 'oldest':
                    return dateA - dateB;
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'favorites':
                    if (a.favorite && !b.favorite) return -1;
                    if (!a.favorite && b.favorite) return 1;
                    return dateB - dateA;
                default:
                    return dateB - dateA;
            }
        });

        return filteredVideos;
    }

    renderVideos() {
        const videoGrid = document.getElementById('videoGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (!videoGrid || !emptyState) return;
        
        const filteredVideos = this.getFilteredAndSortedVideos();

        if (filteredVideos.length === 0) {
            videoGrid.style.display = 'none';
            emptyState.style.display = 'block';
            
            if (this.searchQuery || this.currentFilter !== 'all') {
                emptyState.innerHTML = `
                    <div class="empty-icon"><i class='bx bx-search-alt-2'></i></div>
                    <h3>No media found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                    <button class="btn btn-secondary" onclick="document.getElementById('searchInput').value = ''; window.videoManager.searchQuery = ''; window.videoManager.handleFilter('all')">
                        CLEAR FILTERS
                    </button>
                `;
            } else {
                emptyState.innerHTML = `
                    <div class="empty-icon"><i class='bx bx-image'></i></div>
                    <h3>No media yet</h3>
                    <p>Start by uploading your first video or image to the SHYRED hub</p>
                    <button class="btn btn-primary" onclick="document.getElementById('showVideoForm').click()">
                        UPLOAD FIRST VIDEO
                    </button>
                `;
            }
            return;
        }

        videoGrid.style.display = 'grid';
        emptyState.style.display = 'none';

        videoGrid.innerHTML = filteredVideos.map(video => this.createVideoCard(video)).join('');

        // Setup event listeners for new elements
        this.setupVideoCardEvents();
    }

    setupVideoCardEvents() {
        // Add click listeners to video cards
        document.querySelectorAll('.video-card').forEach(card => {
            const videoId = parseInt(card.dataset.videoId);
            
            card.addEventListener('click', (e) => {
                // Don't open modal if clicking on menu or checkbox
                if (e.target.closest('.video-card-menu') || 
                    e.target.closest('.video-checkbox') ||
                    e.target.closest('.dropdown-menu')) {
                    return;
                }
                this.openVideoModal(videoId);
            });
        });

        // Setup dropdown menus
        this.setupDropdownMenus();
        
        // Setup checkboxes
        this.setupVideoCheckboxes();
    }

    createVideoCard(media) {
        const uploadDate = new Date(media.uploadDate);
        const timeAgo = this.getTimeAgo(uploadDate);
        const duration = media.mediaType === 'video' ? this.formatDuration(media.duration) : '';
        const fileSize = this.formatFileSize(media.fileSize);
        const mediaSrc = media.mediaType === 'video' ? this.getVideoSrc(media) : media.imageData;
        const isImage = media.mediaType === 'image';

        return `
            <div class="media-card ${isImage ? 'image-card' : 'video-card'} ${media.favorite ? 'favorite' : ''} ${this.selectedVideos.has(media.id) ? 'selected' : ''}" data-video-id="${media.id}" data-media-type="${media.mediaType}">
                <div class="video-checkbox">
                    <input type="checkbox" ${this.selectedVideos.has(media.id) ? 'checked' : ''}>
                </div>
                <div class="favorite-indicator"><i class='bx bxs-heart'></i></div>
                <div class="video-card-menu">
                    <button class="menu-trigger">⋮</button>
                    <div class="dropdown-menu">
                        <button class="dropdown-item" data-action="edit" data-video-id="${media.id}">
                            <i class='bx bx-edit dropdown-item-icon'></i>
                            Edit
                        </button>
                        <button class="dropdown-item" data-action="favorite" data-video-id="${media.id}">
                            <i class='bx ${media.favorite ? 'bx-heart-circle' : 'bx-heart'} dropdown-item-icon'></i>
                            ${media.favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                        </button>
                        <button class="dropdown-item" data-action="like" data-video-id="${media.id}">
                            <i class='bx bx-like dropdown-item-icon'></i>
                            Like (${media.likes || 0})
                        </button>
                        <button class="dropdown-item" data-action="comment" data-video-id="${media.id}">
                            <i class='bx bx-comment dropdown-item-icon'></i>
                            Comment (${media.comments?.length || 0})
                        </button>
                        <button class="dropdown-item" data-action="share" data-video-id="${media.id}">
                            <i class='bx bx-share dropdown-item-icon'></i>
                            Share (${media.shares || 0})
                        </button>
                        <button class="dropdown-item" data-action="save" data-video-id="${media.id}">
                            <i class='bx bx-bookmark dropdown-item-icon'></i>
                            Save to Favorites
                        </button>
                        <button class="dropdown-item" data-action="download" data-video-id="${media.id}">
                            <i class='bx bx-download dropdown-item-icon'></i>
                            Download
                        </button>
                        <button class="dropdown-item danger" data-action="delete" data-video-id="${media.id}">
                            <i class='bx bx-trash dropdown-item-icon'></i>
                            Delete
                        </button>
                    </div>
                </div>
                <div class="media-thumbnail ${isImage ? 'image-thumbnail' : 'video-thumbnail'}">
                    ${isImage ?
                        `<div class="image-container">
                            <img src="${mediaSrc}" alt="${media.title}" class="media-content">
                            <div class="media-overlay">
                                <div class="media-type-badge"><i class='bx bx-image'></i> Image</div>
                            </div>
                        </div>` :
                        mediaSrc ? `<div class="video-container">
                            <video preload="metadata" class="media-content">
                                <source src="${mediaSrc}" type="${media.fileType || 'video/mp4'}">
                            </video>
                            <div class="play-overlay">
                                <button class="play-button"><i class='bx bx-play'></i></button>
                            </div>
                            <div class="video-stats">${duration}</div>
                        </div>` : '<div class="video-placeholder">Media not available</div>'
                    }
                </div>
                <div class="media-info">
                    <div class="media-header">
                        <div class="media-avatar">
                            <img src="${media.avatarUrl}" alt="User Avatar">
                        </div>
                        <div class="media-details">
                            <h4 class="media-title">${media.title}</h4>
                            <p class="media-date">${timeAgo} • ${fileSize}</p>
                            <p class="media-username">@${media.username || 'Unknown'}</p>
                        </div>
                    </div>
                    ${media.description ? `<p class="media-description">${media.description}</p>` : ''}

                    <!-- Interaction Buttons -->
                    <div class="media-interaction-buttons">
                        <button class="interaction-btn like-btn" onclick="likeMedia(${media.id})" data-liked="false">
                            <i class='bx bx-heart'></i>
                            <span>${media.likes || 0}</span>
                        </button>
                        <button class="interaction-btn comment-btn" onclick="commentOnMedia(${media.id})">
                            <i class='bx bx-comment'></i>
                            <span>${media.comments?.length || 0}</span>
                        </button>
                        <button class="interaction-btn share-btn" onclick="shareMedia(${media.id})">
                            <i class='bx bx-share'></i>
                            <span>${media.shares || 0}</span>
                        </button>
                        <button class="interaction-btn save-btn" onclick="saveMedia(${media.id})" data-saved="false">
                            <i class='bx bx-bookmark'></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    setupDropdownMenus() {
        document.querySelectorAll('.menu-trigger').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = trigger.nextElementSibling;
                
                // Close all other dropdowns
                this.closeAllDropdowns();
                
                // Toggle current dropdown
                dropdown.classList.toggle('active');
            });
        });

        document.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = item.dataset.action;
                const videoId = parseInt(item.dataset.videoId);
                this.handleDropdownAction(action, videoId);
                this.closeAllDropdowns();
            });
        });
    }

    setupVideoCheckboxes() {
        document.querySelectorAll('.video-checkbox input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                e.stopPropagation();
                const videoId = parseInt(e.target.closest('.video-card').dataset.videoId);
                
                if (e.target.checked) {
                    this.selectedVideos.add(videoId);
                    e.target.closest('.video-card').classList.add('selected');
                } else {
                    this.selectedVideos.delete(videoId);
                    e.target.closest('.video-card').classList.remove('selected');
                }
                
                this.updateBulkActions();
            });
        });
    }

    closeAllDropdowns() {
        document.querySelectorAll('.dropdown-menu').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    }

    handleDropdownAction(action, videoId) {
        const video = this.videos.find(v => v.id === videoId);
        if (!video) return;

        switch (action) {
            case 'edit':
                this.openEditModal(videoId);
                break;
            case 'favorite':
                this.toggleFavorite(videoId);
                break;
            case 'download':
                this.downloadVideo(videoId);
                break;
            case 'copy':
                this.copyVideoLink(videoId);
                break;
            case 'delete':
                this.deleteVideo(videoId);
                break;
        }
    }

    openEditModal(videoId) {
        const video = this.videos.find(v => v.id === videoId);
        if (!video) return;

        this.editingVideoId = videoId;
        
        const editTitleInput = document.getElementById('editVideoTitle');
        const editDescInput = document.getElementById('editVideoDescription');
        const editModal = document.getElementById('editModal');
        
        if (editTitleInput) editTitleInput.value = video.title;
        if (editDescInput) editDescInput.value = video.description || '';
        if (editModal) {
            editModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeEditModal() {
        const editModal = document.getElementById('editModal');
        const editVideoForm = document.getElementById('editVideoForm');
        
        if (editModal) editModal.classList.remove('active');
        if (editVideoForm) editVideoForm.reset();
        this.resetFileInputTexts();
        this.editingVideoId = null;
        document.body.style.overflow = '';
    }

    async handleVideoEdit() {
        if (!this.editingVideoId) return;

        const video = this.videos.find(v => v.id === this.editingVideoId);
        if (!video) return;

        const title = document.getElementById('editVideoTitle')?.value;
        const description = document.getElementById('editVideoDescription')?.value;
        const avatarFile = document.getElementById('editUserAvatar')?.files[0];

        if (!title) {
            this.showNotification('Please enter a title.', 'error');
            return;
        }

        try {
            // Update video properties
            video.title = title.trim();
            video.description = description?.trim() || '';

            // Update avatar if new one is provided
            if (avatarFile) {
                if (avatarFile.size > 5 * 1024 * 1024) {
                    this.showNotification('Avatar file is too large. Maximum size is 5MB.', 'error');
                    return;
                }
                video.avatarUrl = await this.fileToBase64(avatarFile);
            }

            this.saveVideos();
            this.renderVideos();
            this.closeEditModal();
            this.showNotification('Video updated successfully!', 'success');

        } catch (error) {
            console.error('Error updating video:', error);
            this.showNotification('Failed to update video. Please try again.', 'error');
        }
    }

    toggleFavorite(videoId) {
        const video = this.videos.find(v => v.id === videoId);
        if (!video) return;

        video.favorite = !video.favorite;
        this.saveVideos();
        this.renderVideos();
        
        const message = video.favorite ? 'Added to favorites!' : 'Removed from favorites!';
        this.showNotification(message, 'success');
    }

    downloadVideo(videoId) {
        const video = this.videos.find(v => v.id === videoId);
        if (!video) return;

        try {
            const link = document.createElement('a');
            const videoSrc = this.getVideoSrc(video);
            
            if (videoSrc) {
                link.href = videoSrc;
                link.download = video.fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                this.showNotification('Download started!', 'success');
            } else {
                this.showNotification('Video file not available for download.', 'error');
            }
        } catch (error) {
            console.error('Download error:', error);
            this.showNotification('Failed to download video.', 'error');
        }
    }

    copyVideoLink(videoId) {
        const video = this.videos.find(v => v.id === videoId);
        if (!video) return;

        const link = `${window.location.origin}/video.html#${videoId}`;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(link).then(() => {
                this.showNotification('Link copied to clipboard!', 'success');
            }).catch(() => {
                this.showNotification('Failed to copy link.', 'error');
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = link;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                this.showNotification('Link copied to clipboard!', 'success');
            } catch (err) {
                this.showNotification('Failed to copy link.', 'error');
            }
            document.body.removeChild(textArea);
        }
    }

    deleteVideo(videoId) {
        const video = this.videos.find(v => v.id === videoId);
        if (!video) return;

        this.showConfirmationDialog(
            'Delete Video',
            `Are you sure you want to delete "${video.title}"? This action cannot be undone.`,
            () => {
                // Clean up blob URL
                if (video.videoUrl && video.videoUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(video.videoUrl);
                }
                
                // Remove from cache
                this.videoCache.delete(videoId);
                
                // Remove from arrays
                this.videos = this.videos.filter(v => v.id !== videoId);
                this.selectedVideos.delete(videoId);
                
                this.saveVideos();
                this.renderVideos();
                this.updateVideoCount();
                this.updateBulkActions();
                this.showNotification('Video deleted successfully!', 'success');
            }
        );
    }

    updateBulkActions() {
        const bulkActions = document.getElementById('bulkActions');
        const selectedCount = document.getElementById('selectedCount');
        
        if (selectedCount) {
            selectedCount.textContent = this.selectedVideos.size;
        }
        
        if (bulkActions) {
            if (this.selectedVideos.size > 0) {
                bulkActions.classList.add('active');
            } else {
                bulkActions.classList.remove('active');
            }
        }
    }

    bulkFavorite(favorite) {
        this.selectedVideos.forEach(videoId => {
            const video = this.videos.find(v => v.id === videoId);
            if (video) {
                video.favorite = favorite;
            }
        });
        
        this.saveVideos();
        this.renderVideos();
        this.cancelBulkSelection();
        
        const message = favorite ? 'Added to favorites!' : 'Removed from favorites!';
        this.showNotification(message, 'success');
    }

    bulkDelete() {
        if (this.selectedVideos.size === 0) return;

        this.showConfirmationDialog(
            'Delete Videos',
            `Are you sure you want to delete ${this.selectedVideos.size} video(s)? This action cannot be undone.`,
            () => {
                // Clean up resources
                this.selectedVideos.forEach(videoId => {
                    const video = this.videos.find(v => v.id === videoId);
                    if (video && video.videoUrl && video.videoUrl.startsWith('blob:')) {
                        URL.revokeObjectURL(video.videoUrl);
                    }
                    this.videoCache.delete(videoId);
                });
                
                this.videos = this.videos.filter(v => !this.selectedVideos.has(v.id));
                this.selectedVideos.clear();
                this.saveVideos();
                this.renderVideos();
                this.updateVideoCount();
                this.updateBulkActions();
                this.showNotification('Videos deleted successfully!', 'success');
            }
        );
    }

    cancelBulkSelection() {
        this.selectedVideos.clear();
        this.renderVideos();
        this.updateBulkActions();
    }

    showConfirmationDialog(title, message, confirmCallback) {
        const confirmationDialog = document.getElementById('confirmationDialog');
        const confirmationTitle = document.getElementById('confirmationTitle');
        const confirmationMessage = document.getElementById('confirmationMessage');
        
        if (confirmationTitle) confirmationTitle.textContent = title;
        if (confirmationMessage) confirmationMessage.textContent = message;
        if (confirmationDialog) {
            confirmationDialog.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        this.confirmCallback = confirmCallback;
    }

    closeConfirmationDialog() {
        const confirmationDialog = document.getElementById('confirmationDialog');
        if (confirmationDialog) {
            confirmationDialog.classList.remove('active');
            document.body.style.overflow = '';
        }
        this.confirmCallback = null;
    }

    executeConfirmedAction() {
        if (this.confirmCallback) {
            this.confirmCallback();
        }
        this.closeConfirmationDialog();
    }

    openVideoModal(videoId) {
        const video = this.videos.find(v => v.id === videoId);
        if (!video) return;

        // Increment view count
        video.views++;
        this.saveVideos();

        const modal = document.getElementById('videoModal');
        const modalVideo = document.getElementById('modalVideo');
        const modalTitle = document.getElementById('modalTitle');
        const modalDate = document.getElementById('modalDate');
        const modalDescription = document.getElementById('modalDescription');
        const modalAvatar = document.getElementById('modalAvatar');

        const videoSrc = this.getVideoSrc(video);
        
        if (modalVideo && videoSrc) {
            modalVideo.src = videoSrc;
        }
        if (modalTitle) modalTitle.textContent = video.title;
        if (modalDate) modalDate.textContent = this.formatDate(new Date(video.uploadDate));
        if (modalDescription) modalDescription.textContent = video.description || 'No description provided.';
        if (modalAvatar) modalAvatar.src = video.avatarUrl;

        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeVideoModal() {
        const modal = document.getElementById('videoModal');
        const modalVideo = document.getElementById('modalVideo');
        
        if (modal) modal.classList.remove('active');
        if (modalVideo) {
            modalVideo.pause();
            modalVideo.src = '';
        }
        document.body.style.overflow = '';
    }

    updateVideoCount() {
        const filteredVideos = this.getFilteredAndSortedVideos();
        const videoCount = document.getElementById('videoCount');
        if (videoCount) {
            videoCount.textContent = 
                `${filteredVideos.length} video${filteredVideos.length !== 1 ? 's' : ''}`;
        }
    }

    formatDuration(seconds) {
        if (!seconds || seconds === 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    formatFileSize(bytes) {
        if (!bytes) return '0 B';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    }

    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffInMs = now - date;
        const diffInSec = Math.floor(diffInMs / 1000);
        const diffInMin = Math.floor(diffInSec / 60);
        const diffInHour = Math.floor(diffInMin / 60);
        const diffInDay = Math.floor(diffInHour / 24);

        if (diffInSec < 60) return 'Just now';
        if (diffInMin < 60) return `${diffInMin} minute${diffInMin > 1 ? 's' : ''} ago`;
        if (diffInHour < 24) return `${diffInHour} hour${diffInHour > 1 ? 's' : ''} ago`;
        if (diffInDay < 7) return `${diffInDay} day${diffInDay > 1 ? 's' : ''} ago`;
        
        return this.formatDate(date);
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(notif => {
            notif.remove();
        });

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--cyber-blue)' : type === 'error' ? '#ef4444' : 'var(--cyber-purple)'};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    initParticles() {
        if (typeof ParticleSystem !== 'undefined') {
            new ParticleSystem();
        }
    }
}

// Notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .video-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.3);
        color: #9ca3af;
        font-size: 14px;
    }
`;
document.head.appendChild(style);

// Initialize video manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.videoManager = new VideoManager();
    
    if (typeof initSidebarEffects === 'function') {
        initSidebarEffects();
    }
    
    console.log('SHYRED Video Hub with enhanced management features initialized!');
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (!window.videoManager) return;

    if (e.key === 'Escape') {
        const videoModal = document.getElementById('videoModal');
        const editModal = document.getElementById('editModal');
        const confirmDialog = document.getElementById('confirmationDialog');
        
        if (confirmDialog && confirmDialog.classList.contains('active')) {
            window.videoManager.closeConfirmationDialog();
        } else if (editModal && editModal.classList.contains('active')) {
            window.videoManager.closeEditModal();
        } else if (videoModal && videoModal.classList.contains('active')) {
            window.videoManager.closeVideoModal();
        }
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        const showUploadBtn = document.getElementById('showUploadForm');
        if (showUploadBtn) showUploadBtn.click();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.focus();
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        const videoCards = document.querySelectorAll('.video-card');
        if (videoCards.length > 0) {
            e.preventDefault();
            videoCards.forEach(card => {
                const videoId = parseInt(card.dataset.videoId);
                window.videoManager.selectedVideos.add(videoId);
                card.classList.add('selected');
                const checkbox = card.querySelector('input[type="checkbox"]');
                if (checkbox) checkbox.checked = true;
            });
            window.videoManager.updateBulkActions();
        }
    }
});

// Media interaction functions
window.likeMedia = function(mediaId) {
    const media = window.videoManager.videos.find(v => v.id === mediaId);
    if (media) {
        media.likes = (media.likes || 0) + 1;
        window.videoManager.saveVideos();
        window.videoManager.renderVideos();
        window.videoManager.showNotification('Đã thích bài viết!');
    }
};

window.commentOnMedia = function(mediaId) {
    const comment = prompt('Nhập bình luận của bạn:');
    if (comment && comment.trim()) {
        const media = window.videoManager.videos.find(v => v.id === mediaId);
        if (media) {
            if (!media.comments) media.comments = [];
            media.comments.push({
                id: Date.now(),
                text: comment.trim(),
                author: JSON.parse(localStorage.getItem('shyred_current_user') || '{}').username || 'Anonymous',
                timestamp: new Date().toISOString()
            });
            window.videoManager.saveVideos();
            window.videoManager.renderVideos();
            window.videoManager.showNotification('Đã thêm bình luận!');
        }
    }
};

window.shareMedia = function(mediaId) {
    const media = window.videoManager.videos.find(v => v.id === mediaId);
    if (media) {
        media.shares = (media.shares || 0) + 1;
        window.videoManager.saveVideos();
        window.videoManager.renderVideos();

        // Copy to clipboard
        const shareText = `Xem ${media.mediaType === 'image' ? 'ảnh' : 'video'} này: "${media.title}" trên SHYRED`;
        navigator.clipboard.writeText(shareText).then(() => {
            window.videoManager.showNotification('Đã sao chép liên kết chia sẻ!');
        }).catch(() => {
            window.videoManager.showNotification('Đã chia sẻ bài viết!');
        });
    }
};

window.saveMedia = function(mediaId) {
    const currentUser = JSON.parse(localStorage.getItem('shyred_current_user') || 'null');
    if (!currentUser) {
        window.videoManager.showNotification('Vui lòng đăng nhập để lưu bài viết!');
        return;
    }

    const media = window.videoManager.videos.find(v => v.id === mediaId);
    if (media) {
        // Toggle saved status
        if (!currentUser.savedPosts) currentUser.savedPosts = [];

        const savedIndex = currentUser.savedPosts.findIndex(p => p.id === mediaId);
        if (savedIndex !== -1) {
            // Remove from saved
            currentUser.savedPosts.splice(savedIndex, 1);
            window.videoManager.showNotification('Đã bỏ lưu bài viết!');
        } else {
            // Add to saved
            currentUser.savedPosts.push({
                id: mediaId,
                savedAt: new Date().toISOString()
            });
            window.videoManager.showNotification('Đã lưu bài viết!');
        }

        localStorage.setItem('shyred_current_user', JSON.stringify(currentUser));

        // Update users array
        const users = JSON.parse(localStorage.getItem('shyred_users') || '[]');
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('shyred_users', JSON.stringify(users));
        }

        window.videoManager.renderVideos();
    }
};
