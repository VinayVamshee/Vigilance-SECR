import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import HTMLFlipBook from 'react-pageflip';
import { Document, Page, pdfjs } from 'react-pdf';
import flipAudio from './AUDIO-2025-02-07-17-56-20.mp3';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

// Page Component
const Pages = React.forwardRef((props, ref) => (
    <div className="demoPage" ref={ref}>
        {props.children}
    </div>
));

Pages.displayName = 'Pages';

export default function Documentation() {
    const flipSound = new Audio(flipAudio);
    const flipbookRef = useRef(null);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const file = queryParams.get('file'); // Get the file link from URL

    const [searchQuery, setSearchQuery] = useState("");
    const [matches, setMatches] = useState([]);


    const [numPages, setNumPages] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [processedFile, setProcessedFile] = useState(null);

    function getPreviewLink(originalLink) {
        const match = originalLink.match(/(?:\/d\/|id=)([\w-]+)/);
        if (match) {
            const fileId = match[1];

            if (originalLink.includes('docs.google.com/document')) {
                return `https://docs.google.com/document/d/${fileId}/export?format=pdf`;
            } else if (originalLink.includes('docs.google.com/spreadsheets')) {
                return `https://docs.google.com/spreadsheets/d/${fileId}/export?format=pdf`;
            } else if (originalLink.includes('docs.google.com/presentation')) {
                return `https://docs.google.com/presentation/d/${fileId}/export/pdf`;
            } else {
                return `https://drive.google.com/uc?export=download&id=${fileId}`;
            }
        }
        return originalLink;
    }

    useEffect(() => {
        if (file) {
            setProcessedFile(getPreviewLink(file));
        }
    }, [file]);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
        extractText();
    }

    const extractText = useCallback(async () => {
        if (!processedFile) return;

        const loadingTask = pdfjs.getDocument(processedFile);
        const pdf = await loadingTask.promise;
        let extractedMatches = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();

            // Convert text items into an array of lines
            const lines = textContent.items.map((item) => item.str);
            const pageText = lines.join(" "); // Entire page as a single string

            if (searchQuery) {
                const regex = new RegExp(searchQuery, "gi");
                let match;
                let uniqueLines = new Set(); // Use a Set to prevent duplicate lines

                while ((match = regex.exec(pageText)) !== null) {
                    // Find all lines that contain the match
                    // eslint-disable-next-line 
                    lines.forEach((line) => {
                        if (line.includes(match[0])) {
                            uniqueLines.add(line); // Add unique lines
                        }
                    });
                }

                // Convert Set to array and add to extractedMatches
                uniqueLines.forEach((line) => {
                    extractedMatches.push({ text: line, page: i });
                });
            }
        }

        setMatches(extractedMatches);
    }, [processedFile, searchQuery]);


    useEffect(() => {
        extractText();
    }, [extractText]);

    function handleFlip(event) {
        flipSound.play().catch((e) => console.error("Audio play error:", e));
        setCurrentPage(event.data + 1);
    }

    const flipToNextPage = () => {
        if (currentPage < numPages) {
            flipbookRef.current.pageFlip().flipNext(['top']);
            setCurrentPage(currentPage + 1);
        }
    };

    const flipToPrevPage = () => {
        if (currentPage > 1) {
            flipbookRef.current.pageFlip().flipPrev(['top']);
            setCurrentPage(currentPage - 1);
        }
    };

    const flipToPage = (pageNumber) => {
        if (flipbookRef.current) {
            flipbookRef.current.pageFlip().turnToPage(pageNumber - 1); // Pages start at 0
            setCurrentPage(pageNumber);
        }
    };


    const [dimensions, setDimensions] = useState({ width: 500, height: 707 });

    useEffect(() => {
        function updateDimensions() {
            const screenWidth = window.innerWidth;

            if (screenWidth > 800) {
                // Use default dimensions for larger screens
                setDimensions({ width: 500, height: 707 });
            } else {
                // Calculate dimensions for smaller screens based on A4 aspect ratio
                const responsiveWidth = screenWidth * 0.9; // 90% of the screen width
                const responsiveHeight = responsiveWidth * 1.414; // A4 aspect ratio
                setDimensions({ width: responsiveWidth, height: responsiveHeight });
            }
        }

        // Update dimensions initially and on window resize
        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    const [bgColor, setBgColor] = useState(localStorage.getItem("bgColor") || "");
    const [bgImage, setBgImage] = useState(localStorage.getItem("bgImage") || "");
    const [bgVideo, setBgVideo] = useState(localStorage.getItem("bgVideo") || "");

    // ✅ Save to localStorage whenever values change
    useEffect(() => {
        localStorage.setItem("bgColor", bgColor);
    }, [bgColor]);

    useEffect(() => {
        localStorage.setItem("bgImage", bgImage);
    }, [bgImage]);

    useEffect(() => {
        localStorage.setItem("bgVideo", bgVideo);
    }, [bgVideo]);


    return (
        <div className="flipbook-container"
            style={{
                backgroundColor: bgVideo ? "transparent" : bgImage ? "transparent" : bgColor,
                backgroundImage: bgVideo ? "none" : bgImage ? `url(${bgImage})` : "none",
            }}>
            {bgVideo && (
                <video autoPlay loop muted playsInline className="bg-video" style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    zIndex: -1
                }} >
                    <source src={bgVideo} type="video/mp4" />
                </video>
            )}

            <Link className='backbutton' to='/index'>Back</Link>


            <div className="search-container">
                <input type="text" placeholder="Search in PDF..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                {searchQuery && matches.length > 0 && (
                    <div className='matches'>
                        {matches.length} Matches Found
                        <ul className="match-list">
                            {matches.map((match, index) => (
                                <li key={index} onClick={() => flipToPage(match.page)}>
                                    <strong>Page {match.page}:</strong> {match.text}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="background-selector">
                <details>
                    <summary className="dropdown-button mx-5">🎨 Choose Background</summary>
                    <div className="dropdown-content">
                        <label className="color-picker">
                            🎨 Background Color:
                            <input
                                type="color"
                                value={bgColor}
                                onChange={(e) => {
                                    setBgColor(e.target.value);
                                    setBgImage("");
                                    setBgVideo(""); // Reset image & video if color is chosen
                                }}
                            />
                        </label>

                        <label className="bg-picker">
                            🖼️ Background Image:
                            <input
                                type="url"
                                value={bgImage}
                                onChange={(e) => {
                                    setBgImage(e.target.value);
                                    setBgColor("");
                                    setBgVideo(""); // Reset color & video if image is chosen
                                }}
                                placeholder="Enter image URL"
                            />
                        </label>

                        <label className="video-picker">
                            🎥 Background Video:
                            <input
                                type="url"
                                value={bgVideo}
                                onChange={(e) => {
                                    setBgVideo(e.target.value);
                                    setBgColor("");
                                    setBgImage(""); // Reset color & image if video is chosen
                                }}
                                placeholder="Enter video URL (MP4)"
                            />
                        </label>
                    </div>
                </details>
            </div>

            {processedFile ? (
                <div className='view-download'>
                    <Document file={processedFile} onLoadSuccess={onDocumentLoadSuccess}>
                        {numPages && (
                            <>
                                <HTMLFlipBook
                                    ref={flipbookRef}
                                    width={dimensions.width}
                                    height={dimensions.height}
                                    showCover={false}
                                    mobileScrollSupport={true}
                                    onFlip={handleFlip}
                                    className='flipbook'  // Flipbook styling

                                >
                                    {[...Array(numPages).keys()].map((pNum) => (
                                        <Pages key={pNum} number={pNum + 1} className="flipbook-page">
                                            <Page
                                                pageNumber={pNum + 1}
                                                width={dimensions.width}
                                                renderAnnotationLayer={false}
                                                renderTextLayer={false}
                                                className="pdf-page"  // Individual PDF Page styling
                                            />
                                        </Pages>
                                    ))}
                                </HTMLFlipBook>

                                <div className="page-indicator">
                                    Page {currentPage} / {numPages}
                                </div>
                            </>
                        )}
                    </Document>
                    <div className="page-navigation">
                        <button onClick={flipToPrevPage} disabled={currentPage === 1} className="btn">
                            Prev Page
                        </button>
                        <a href={processedFile} download className="btn">
                            Download PDF
                        </a>
                        <button onClick={flipToNextPage} disabled={currentPage === numPages} className="btn">
                            Next Page
                        </button>
                    </div>
                </div>
            ) : (
                <h3>No Document Selected</h3>
            )}
        </div>
    );
}
