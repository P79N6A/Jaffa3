import React, { Component } from 'react';

class Footer extends Component {
    getYear = () => {
        const today = new Date();
        return today.getFullYear();
    };

    render() {
        return (
            <footer className="footer">
                <div className="container">
                    <div className="row align-items-center flex-row">
                        <div className="col-12 col-lg-auto mt-3 mt-lg-0 text-center">
                            <div className="row align-items-center justify-content-center">
                                <div className="col-auto">
                                    &copy; {this.getYear()} <a href="//whitehat.ro/">WhiteHat Security</a>
                                </div>
                                <div className="col-auto">
                                    <ul className="list-inline text-center mb-0">
                                        <li className="list-inline-item">
                                            <a href="//whitehat.ro" target="_blank" rel="noopener noreferrer">Homepage</a>
                                        </li>
                                    </ul>
                                </div>
                                <div className="col-auto">
                                    <a href="mailto:zmeu@whitehat.ro" className="btn btn-outline-primary btn-sm" target="_blank" rel="noopener noreferrer">
                                        Report an issue
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        );
    }
}

export default Footer;
