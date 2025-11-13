import React, { Component } from 'react';
import { Container, Button } from 'react-bootstrap';


class Guarded extends Component {
render() {
const { openLogin } = this.props;
return (
<Container className="py-5 text-center">
<h3 className="mb-3">Please log in to continue</h3>
<p className="text-secondary">Access to this page is restricted. Log in or create an account.</p>
<Button onClick={openLogin}>Open Login</Button>
</Container>
);
}
}


export default Guarded;