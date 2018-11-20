import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Menu from './Menu';
import Version from './Version';
import './Header.css';

class Header extends Component {
    state = {
        isMenuOpen: false,
        isDropdownOpen: false,
    };

    toggleMenuOpen = () => {
        this.setState(prevState => ({ isMenuOpen: !prevState.isMenuOpen }));
    };

    closeMenu = () => {
        this.setState({ isMenuOpen: false });
    };

    render() {
        const { dashboard } = this.props;
        const badgeClass = classnames({
            'badge dns-status': true,
            'badge-success': dashboard.protectionEnabled,
            'badge-danger': !dashboard.protectionEnabled,
        });

        return (
            <div className="header">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="header-toggler d-lg-none ml-2 ml-lg-0 collapsed" onClick={this.toggleMenuOpen}>
                            <span className="header-toggler-icon"></span>
                        </div>
                        <div className="col col-lg-3">
                            <div className="d-flex align-items-center">
                                <Link to="/" className="nav-link pl-0 pr-1">
                                    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABWWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgpMwidZAAALR0lEQVR4Ae2cbXBU1RnHn7O7eSEQICQBhQQiIhRobKsW1FoFmapAXz6ZGQ2JhGwibcfOtNPpjP3ApJ0640zHkbEdiiGJeVnDlPpBO7UyZeqMMJaqrVZF0FFeQjEUeVFaiHnbPf0/d0OySVyS3eyGu8v/zJzk3HvPOffc3/3f85xz73NWhIEESIAESIAESIAESIAESIAESIAESIAESIAESIAESIAESIAESIAESIAESIAESIAESIAESIAESIAESIAESIAESIAESIAESIAESIAESIAESIAESIAESIAESIAESIAESIAESCBeAibegiwXI4HywHTJCi4XY4rEeBaLDS0QjykUK9nhmuw5pP8hRnZLQ+WhGGt3XXYKK9m3pPbpHAlmLxHxLhWxKyCc+TjldYjzEPMRPYgaLiK+K8a+KMa3XeofPOPsTdE/FFaib1xte4HYvq+K9a4UCd0qYpbjFCqkWMInYs2j0rihKZZCbspLYU30bmxunS399jaYuJsghtWo7muI0yZa7UD5X0tDxc8SVNekVkNhxYq7tvl6CXm/gWJfRm+0DuZNe6SRoRf7j+D4EbH2Y/F4PsX46VP0YF0QXw/MXRaOzcC+fAiy2DGRIkUjKwlv28cx5nr0i4+5dy+FFe3ePPJUllwonC3evlKMi1ZCBDdBDGuQfcqIIhbbbyPuh4g+xJDpdZHMQ9JYdm5Evuib9+/KlOnd90JkP0GmVaMyWlMOs9g+ar+Ld1zdwtrUmCuSXSi+IGZnZhGEcyNma8vw/wbcMwy4RwX0OnIQAtgbFpE5JJmZB2Rb2YVROePdUdO6GW3ZiuLo1QZDCEP8IqmvODm4x+WJ9BOWPv153ddAIBCNF+bGzsQ9uBY9SSFM0dwB0ajZKUGMNhb6GPkOoew76K0OwHQdkWDGh9L0QCfKJD+EzW0AJ8LgfzD8GeOt9YNbLk+kj7Cqn71TTPAHEMQtYH79GNxP43gHxjaHkf99pD+AeDol6P23zJ97XOpW949RPvmH9QGZ2fM6TPBXBk9m7CrZUfnK4LaLE+khrOrAFgjjFxGceyCYfRAOxCMYRMtRbB9FD3RGsrL+k1DTFXHShCf9AfSsOgmQjIG630CvtSLh50lChakvLH/r3RDNXyPYtEio9xFpqv5fxL7UTfrbHkDjIwbudg1miS+7/YIuvfV1ezujt89ixjYUOvBEb0wbUel1NVTsxN89Q5dofj6Udm8q9YUlnr1DeO0fh9LplDKbIq5mjdS2fyli25XJ1BdW44ZXMXM76NA15pgrKU+0UQ0bTmCs9fhgNaH+hwfTLk2kvrAUbMg84fC1JvXHjNGEkpv9SxzS92gaKkVnjS4O6SGs4o+awRhvwG2pi1lPrGlPln2OK9wSrsTMkhm9351YhcktnR7CqqsLAZM+0TcnF9cVrr348Da0AGZRg60O/3fn3/QQlrItOgxh2R2i/k/pGpwHyNYNXN594m+fk66X6r7rqqtLn4clGl1/W4f426zod0WXhvS7CWGz6FLcCWqWNeGxVgheDy4N6TuLcinwxDTLGvEHzqOuXOkNFUjrQ2cTU2/iakm/HitxbFxck7F4d1fnNDDDe68bG+pzRaMqWqdKlg8uLP05WLmSJyF4VjruLp5c8Vi4v2hEWmwOpty5iFkAm4W2X4q60kXT+qCEcCwDebxIqxOeBu2Z1WMhiD392NKP1PDyDHXjv3p1duE8F1ASCxrsefhbfYaP2vD6NGexouY0vCbgtJd9XurLtJdwR5hX9JScOPEE2qnmMOJbojual0RTiO66dme+9AfzHbE4rreOP5TOZGbjBufhBhciYvGBzMK+PEQVh1vDGbT1EwjvFATXiTafwnUdhlQ/Ep+clO5g56SbJH9bE2BV4XtiEu9jfLdjYg2qbMlH3zAfHcVcQF6AXqYEwBeiKXPwJC1AbwDHOqfniK91qVUKooPQDN4zWfseBPguLr1Dppw9IL/5EXrIJITNLfOk33MCve2tUl/5WhLOEHeVYwvLcd/NWAJgWBfnuQ7AbkS6FGfEIoBR/t8jGwJzI+pU919Edd/VtXNwZ7EwP57PUQ9MEcyRQdpa5DV9OB5E7IMwL5kxbCKEdNt4UUY/ZcA/yaqPUjZ6D/igmxzk1/dX6o8OkylTEdU7dDqiepDq9pUKR3DiY2j3m2jr2xIKvS9NFf9Em4dfX7yt87e9hKLqp7Ul3iqSUW64sGoDpRK0t2OksgQ9TwlOuAhRzVQ+oo5jIAQLoRgVC55QmAPjONOdxPgE4xGN3nMof1H6PBehmS7J7L0o9Q+rYCY36Pus48VTxZc5DcKd5rgqWzMHN7YAvSvclNVd2eLasM+ihxWLaGZj/2SY46M433s47z6s4DkoPvOq/K780nfA2DjVBL6Nh26tNFb8MLaCyc09XFj+tlV4qu5E16pP+Sk0uBO9VCcu/Lj09J6W5qrPktucK1i7rsrpKch1xoRq2o2F8EJYDm8K0Cr1kVezPg9RH7IZiImbURv06FZX+lgs0jD7oe39417lU/t0hoRyqsTTFcAD3IV2uSIMF5YrmuTyRugMNtNcC1NeDPFhfGkLIbHw+FJMCVqvvZ7GiQQVyF7Ev+Mh3y1Ts98R/QgdLeiiWU92l5tcrimsaDcr3v364x85ZiFMbgmEhx7Os1QMlpRZo72dLvLQ1yCxhg4U2Ic6XpKMvr/J9qpjsVYw2fkprMkifv8ur8zoXoxxKHo5/bUZewvM30JsY0W1M8EYb0u059qPci+inpdlR/m/xltwMvNRWJNJ+4vOVdumk4j5MK1YLOuIbRlEo0vYdLI0drDyGszln1Bmj5teOVBYY9+6yc+x8ZlrxOe7AUK7A5OHZRDeXZix6uudyweDCYCV5zEDfkEaH3rr8pmTe5TCSi7fxNTuzPymLEKvdBfcsEvxfzUqXoJ4uZnpGxDmcxiXvYD3Zh8kpiHjr4XCGj8rd+WsaVmMXux2NOqbEM9t+I8X2FGCkb8g73PiRU+2vVLfPyY9UFhJRzxJJ6gJfN0Zo4msxRlvRtT3biMCfo7SwFSGzB/wQnX3iIMJ3aSwEorTJZV9/9k8vOhdAQGthZDuQKtUaCPDAQixHb88+HtpKtfPTgkNFFZCcbq0sprm5RDQOrTubsRvIUa+S4M7kd0FU9mM7417EnUFFFaiSKZKPeoR0edZi++l96DHUrMZ+VNOb2EW+oz0BNsn6gJEYaWKIJLRzupds+DvuA4CWw+T+R2cYsgLxMo29GuN+LG3N+M5NYUVD7V0LKMik977ILAymMbvRVziK3g3thWD/ecj9o2ZpLDGRHQVZqjaWSy+vvUY/G+E0FYOEOiEmXxMss81jsdxkcK6CnUT0yX7W5fic9OD+KCu/l7qPo5gH5Ne++TlxmEUVpgU/46HwKbAPfgu+VNk1ZklJpK2CWbyV/ghODguDg8U1nAe3BoPAf1wHjQ1ENaPkX2mI7CQ/W3k90kKazwgmSc6gZq2cvRa6MVMizRs2Bo9I4+QAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQAAmQwNVL4P+G0p3Kkwgg9gAAAABJRU5ErkJggg==" alt="" className="header-brand-img" />
                                </Link>
                                {!dashboard.proccessing && dashboard.isCoreRunning &&
                                    <span className={badgeClass}>
                                        {dashboard.protectionEnabled ? 'ON' : 'OFF'}
                                    </span>
                                }
                            </div>
                        </div>
                        <Menu
                            location={this.props.location}
                            isMenuOpen={this.state.isMenuOpen}
                            toggleMenuOpen={this.toggleMenuOpen}
                            closeMenu={this.closeMenu}
                        />
                        <div className="col col-sm-6 col-lg-3">
                            <Version
                                { ...this.props.dashboard }
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

Header.propTypes = {
    dashboard: PropTypes.object,
    location: PropTypes.object,
};

export default Header;
