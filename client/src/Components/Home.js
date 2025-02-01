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
                <span>VIGILANCE - SECR</span>

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
                    <img src='https://cdn-icons-png.flaticon.com/512/5988/5988117.png' alt='...' />Vigilance - SECR
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


            <h1>VIGILANCE BILASPUR SOUTH EAST CENTRAL RAILWAY</h1>
            <div id="carouselExampleAutoplaying" className="carousel custom-carousel slide" data-bs-ride="carousel" data-bs-interval="2000">
                <div className="carousel-inner">
                    {images.map((image, index) => (
                        <div className={`carousel-item ${index === 0 ? 'active' : ''}`} key={image._id}>
                            <img src={image.imageUrl} className="d-block" alt="..." />
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

            <button className="btn btn-primary" onClick={() => setPage("index")}>
                Go to Websites
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

            {/* Modals */}
            {/* About Modal */}
            <div className="modal fade" id="aboutModal" tabIndex="-1" aria-labelledby="aboutModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="aboutModalLabel">About</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <div className='AboutWebsite'>
                                <p>
                                    <strong>W</strong>elcome to our website, designed to enhance your browsing experience and save you time.
                                    With our platform, you can easily search for and save your favorite websites without the hassle of searching each time.
                                    Our user-friendly interface allows you to categorize your saved sites, add unique logos, and customize your experience to suit your needs.
                                    Plus, you can edit all details to keep your information up to date and even change the wallpaper to personalize your space.
                                    This website can be accessed anywhere, on any device—whether it's a mobile phone, tablet, or laptop.
                                    Simplify your online navigation and make the most of your web experience with us!
                                </p>

                                <p>If you don't have an account or prefer not to create one, you can still enjoy quick access to our pre-saved websites directly from the home screen. Simply browse through the curated categories and popular sites we've saved to make it easy for you to find essential websites, no sign-up needed!</p>
                                <br />
                                <h4>Quick Start Guide</h4>
                                <h5>Sign Up:</h5>
                                Go to Login, select New User? Register, and create your account.<br /><br />
                                <h5>Log In:</h5>
                                Use your new credentials to log in.<br /><br />
                                <h5>Add Websites:</h5>
                                On your dashboard, start adding websites to your personal collection.<br /><br />
                                <h5>Organize & Customize:</h5>
                                Add categories, logos, and set a background for easy access.<br />
                                Now, all your favorite sites are saved and easy to find!
                            </div>
                            <div className='AboutAdmin'>
                                <div className='adminDetails'>
                                    <strong>Srinivas Rao</strong>
                                    <strong2>Contact Details</strong2> <a href="tel:9752375075">9752375075</a>
                                    <a href="mailto:cvipsecr@gmail.com">cvipsecr@gmail.com</a>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer privacy">
                            Your privacy is our top priority. All personal information and account details provided on this website are securely stored and protected against unauthorized access. We adhere to strict privacy standards, ensuring that your data remains safe and is never shared with third parties. Enjoy a secure experience every time you visit.
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
