import React, { useEffect, useState } from 'react'
import axios from 'axios';

export default function Home({ setPage }) {

    const [images, setImages] = useState([]);
    useEffect(() => {
        axios.get('https://vigilance-secr-server.vercel.app/images')
            .then((response) => {
                setImages(response.data);
            })
            .catch((error) => {
                console.error('There was an error fetching the images!', error);
            });
    }, []);

    const AdminToken = localStorage.getItem('AdminToken');

    // Handle delete request
    const handleDeleteImage = async (id) => {
        try {
            await axios.delete(`https://vigilance-secr-server.vercel.app/images/${id}`);
            setImages(images.filter(image => image._id !== id));  // Remove deleted image from state
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    };

    const defaultBackgroundColor = 'https://c4.wallpaperflare.com/wallpaper/379/399/753/rainbow-day-light-wait-wallpaper-preview.jpg';
    const [backgroundImage, setBackgroundImage] = useState(defaultBackgroundColor);
    // eslint-disable-next-line 
    const [commonBackground, setCommonBackground] = useState(defaultBackgroundColor);

    useEffect(() => {
        const fetchCommonBackground = async () => {
            try {
                const response = await axios.get('https://vigilance-secr-server.vercel.app/getCommonBackground');
                setCommonBackground(response.data.backgroundImage || defaultBackgroundColor);
                setBackgroundImage(response.data.backgroundImage || defaultBackgroundColor);
            } catch (error) {
                console.error("Error fetching common background:", error);
                setBackgroundImage(defaultBackgroundColor);
            }
        };
        fetchCommonBackground();
    }, []);

    const googleSearch = (event) => {
        event.preventDefault();
        var text = document.getElementById("search").value;
        var cleanQuery = text.replace(" ", "+", text);
        var url = "http://www.google.com/search?q=" + cleanQuery;
        window.open(url, '_blank');
    };

    const handleFeedbackSubmit = async (event) => {
        event.preventDefault();
        const name = event.target.name.value;
        const message = event.target.message.value;

        try {
            await axios.post('https://vigilance-secr-server.vercel.app/feedback', { name, message });
            alert('Thank You for your valuable feedback.');
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('Error submitting feedback. Please try again.');
        }
    };

    return (
        <div className='Home' style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>

            <div className='mobile-Navigation'>
                <button className="btn" type="button" data-bs-toggle="collapse" data-bs-target="#Navigation-Collapse" aria-expanded="false" aria-controls="Navigation-Collapse">
                    <img src='https://www.freeiconspng.com/thumbs/menu-icon/menu-icon-24.png' alt='...' />
                </button>
                <form className='Search' onSubmit={googleSearch}>
                    <input id='search' type='text' placeholder='Google Search...' />
                </form>
                <span>Indian Railway</span>

            </div>

            <div className="collapse" id="Navigation-Collapse">
                <div className='options'>
                    <button type="button" className="btn btn-info" data-bs-toggle="modal" data-bs-target="#aboutModal">
                        About
                    </button>
                    <button className='btn btn-warning' data-bs-toggle="modal" data-bs-target="#FeedbackModal">Feedback</button>
                </div>
            </div>

            <div className='Navigation'>
                <logo>
                    <img src='https://cdn-icons-png.flaticon.com/512/5988/5988117.png' alt='...' />Indian Railway
                </logo>

                <form className='Search' onSubmit={googleSearch}>
                    <input id='search' type='text' placeholder='Google Search...' />
                </form>

                <div className='options'>
                    <button type="button" className="btn btn-info" data-bs-toggle="modal" data-bs-target="#aboutModal">
                        About
                    </button>
                    <button className='btn btn-warning' data-bs-toggle="modal" data-bs-target="#FeedbackModal">Feedback</button>
                </div>
            </div>

            <div className='content'>
                <h1>VIGILANCE BRANCH
                    <h3>South East Central Railway <br />Bilaspur</h3>
                </h1>
                <div id="carouselExampleAutoplaying" className="carousel custom-carousel slide" data-bs-ride="carousel" data-bs-interval="2000">
                    <div className="carousel-inner">
                        {images.map((image, index) => (
                            <div className={`carousel-item ${index === 0 ? 'active' : ''}`} key={image._id}>
                                <img src={image.imageUrl} className="" alt="..." />
                            </div>
                        ))}
                    </div>
                    <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="prev">
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Previous</span>
                    </button>
                    <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleAutoplaying" data-bs-slide="next">
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Next</span>
                    </button>
                </div>
                <p>A Window for Indian Railway Information</p>
                <button className="btn btn-dark shadow-lg" onClick={() => setPage("index")}>
                    Proceed
                </button>

                {
                    AdminToken ?
                        <ul>
                            {images.map((image) => (
                                <li key={image._id}>
                                    <img src={image.imageUrl} alt="..." style={{ width: '200px' }} />
                                    <button className='btn btn-outline-danger' onClick={() => handleDeleteImage(image._id)}>Delete</button>
                                </li>
                            ))}
                        </ul>
                        :
                        null
                }
            </div>

            {/* Modals */}
            {/* About Modal */}
            <div className="modal fade" id="aboutModal" tabIndex="-1" aria-labelledby="aboutModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-xl">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="aboutModalLabel">About</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className='AboutWebsite'>
                                <p>
                                    <strong>W</strong>elcome to our website, created to simplify your browsing experience and save you time. Our platform allows you to easily search for, save, and categorize your favorite websites, all without the hassle of repeated searches. You can personalize your space by adding unique logos, editing details to keep your information up to date, and even changing the wallpaper to suit your style. Accessible from any device—whether mobile, tablet, or laptop—our website enhances your online navigation.

                                </p>

                                <p>Even if you don't have an account or prefer not to create one, you can still access a range of pre-saved websites directly from the home screen. Browse through our curated categories and popular sites, and enjoy quick access to essential websites without any sign-up required.

                                </p>
                                <br />
                                <div className='QuickGuide'>
                                    <h4>Quick Start Guide</h4>
                                    <br /><h5>Sign Up:</h5> To create an account, go to the Login page and select "New User? Register" to sign up and set up your account.
                                    <br /><br />

                                    <h5>Log In:</h5> Once your account is created, use your credentials to log in and access your personalized dashboard.
                                    <br /><br />

                                    <h5>Add Websites:</h5> Start adding websites to your personal collection directly from your dashboard for easy access later.
                                    <br /><br />

                                    <h5>Organize & Customize:</h5> You can organize your saved sites into categories, add logos for quick identification, and even set a custom background to personalize your space.
                                    <br /><br />

                                    Now, all your favorite websites are saved, organized, and ready to be easily accessed whenever you need them!
                                </div>
                            </div>
                            <div className='AboutAdmin'>
                                <div className='adminDetails'>
                                    <strong>Srinivas Rao</strong>
                                    <a href="tel:9752375075">9752375075</a>
                                    <a href="mailto:cvipsecr@gmail.com">cvipsecr@gmail.com</a>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer privacy">
                            <strong2>Disclaimer</strong2>
                            This website is intended solely for educational and informational purposes. All links to government websites and railway websites are provided for easy access and convenience. This website should not be referenced in any official or legal context, and the content provided should not be quoted or used in any legal matters. We do not endorse or promote any misuse of the resources linked on this website. The information provided is for knowledge sharing and public access only.
                        </div>
                    </div>
                </div>
            </div>

            {/* Feedback Modal */}
            <div className="modal fade" id="FeedbackModal" tabIndex="-1" aria-labelledby="FeedbackModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="FeedbackModalLabel">Submit Feedback</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleFeedbackSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label">Name</label>
                                    <input type="text" className="form-control" id="name" required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="message" className="form-label">Message</label>
                                    <textarea className="form-control" id="message" required></textarea>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                    <button type="submit" className="btn btn-primary">Submit Feedback</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}
