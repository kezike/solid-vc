# SolidVC
This package contains a [Verifiable Credentials](https://w3c.github.io/vc-data-model/) framework built on top of [Solid](https://solid.inrupt.com/).

### Getting Started
To get started with `solid-vc`, navigate to your local `solid-vc` directory and run `npm run setup`. This script takes care of creating keypairs, authenticating you with Solid, setting up necessary folders in your POD, and anything else you could possibly need to use the platform. If you do not already own a Solid account, please visit https://solid.inrupt.com/get-a-solid-pod to get started. The sign-up process takes minutes!

### Launch `solid-vc`
In order to launch `solid-vc`, run `npm start` and open http://localhost:PORT, where PORT is typically a 4-5 digit number that is reported to you as an output of `npm start`. (Note: On startup, you will be prompted to login again)

### Additional Notes
- Be sure to enable pop-ups from the host of interest (ie. http://localhost:8080/), so that you can properly login to your Solid account upon launching. This can be configured from the browser upon launch by following the prompt that appears at the right of the URL search bar.
- At the moment, claims are issued only in N3, but extended RDF serialization support is in the works!
- Do not be alarmed by ex marks in the `Review` interface of the `Issuer` role. At the moment, this interface loads and displays everything in your Solid inbox and only expects to receive signed credential request messages in JSON-LD. If the messages in your inbox are instead actual credentials or any other arbitrary data, this will either return an ex-mark next to the message or nothing at all. In the future, the inbox will be refactored out of the the Issuer interface and into its own module, where proper filtering, displaying, and action prompting will be presented.
