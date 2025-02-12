import React, { useEffect, useRef, useState } from 'react';
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
    }

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

    const [bgColor, setBgColor] = useState("#ffffff");

    return (
        <div className="flipbook-container" style={{ backgroundColor: bgColor }}>
            <Link className='backbutton' to='/index'>Back</Link>
            <label className="color-picker">
                🎨 Choose Background:
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
            </label>
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
