# FHE Benchmarking Suite

**Measuring Performance of Computing on Encrypted Data**

## About the FHE Benchmarking Suite

This Benchmarking Suite provides standardized workloads and metrics to help application developers evaluate whether FHE is feasible for their use cases. Our goal is to enable informed decisions about deploying FHE solutions, by providing comprehensive performance data across different implementations and platforms.

Each benchmark provides comprehensive metrics including:

- **Latency and Throughput** - Wall-clock time for single workload instances and batch processing performance
- **Memory Consumption** - Maximum RAM required during execution
- **Storage Requirements** - Keys, ciphertexts, and intermediate values
- **Communication Complexity** - Data exchanged between client and server
- **Quality Metrics** - Accuracy loss compared to plaintext (where applicable)

### Who Benefits from These Benchmarks?

- **Application Developers** - Assess end-to-end cost and feasibility of FHE for their use cases
- **FHE Library/Compiler Developers** - Optimize scheme-level performance
- **Hardware Vendors** - Evaluate and showcase hardware performance for FHE workloads

## Current Benchmark Workloads

Each workload represents a real-world use case with clear specifications, reference implementations, and correctness requirements.

- [**Fetch-by-Similarity**](https://github.com/fhe-benchmarking/fetch-by-similarity). Private database queries using cosine similarity search over encrypted data.

- [**ML Inference**](https://github.com/fhe-benchmarking/ml-inference). Privacy-preserving machine learning inference on encrypted inputs. Currently features MNIST digit classification, with other models to come.

*Additional workloads are under development. Check back for updates.*

## Suite Structure

The benchmarking suite is organized around a set of git repositories under [github.com/fhe-benchmarking](https://github.com/fhe-benchmarking).

Each workload repository includes a `harness` subdirectory (provided by us), and a `submission` subdirectory that submitters fill with their solution.

### Submission Directory Content

- **Open-source software submission:** The `submission` subdirectory must contain the complete implementation code.
- **Hardware-based submission:** Must contain shims for communicating with the backend where the actual implementation resides. It is highly recommended to open-source the encryption/decryption code even for those submissions.
- **Closed-source software:** Can either use a shim with backend implementation (as for hardware), or include a pre-compiled library or container with shims that call them.

Core workload computation must be performed on encrypted data, but pre-processing before encryption and post-processing after decryption are allowed. Submitters must explicitly document these steps, if they are used.

To make comparisons easier, software-only submissions should be tested on similar platforms. Currently (2026) we recommend platforms with 4th-gen Intel Xeon (Sapphire Rapids), with around 90 vCPUs and around 192GB memory. Example of such platforms include EC2 C7i.metal-24XL, GCP C3 HighCPU-88, and Azure D96lv-v6. Submissions that reply on accelerated copmuting should specify the acceleration hardware that they use. (For example how many GPUs of what type.)

### Security Requirements

Workloads must be encrypted with parameters supporting **at least 128-bit security**. Submitters must specify why they believe their submission provides the required security level.

### Documentation Requirements

Submitters must update the README file with instructions on how to run their workload.

- If a backend is required, the README must include the procedure for getting access to that backend. *Backends should remain available for at least a few weeks following initial submission* to allow result replication. Submitters are *not* required to provide access to everyone, but are expected to allow reasonable validation of their claimed performance.
- The README must also include a description of how the solution works, FHE scheme(s) and parameters, and why this implementation enjoys at least 128-bit security. (Alternatively it can include a pointer to somewhere else where this is described.)

## How to Submit Solutions

When implementing one of the workloads from the benchmarking suite, submitters must:

1. Fork the relevant repository under [github.com/fhe-benchmarking](https://github.com/fhe-benchmarking)
2. Replace the content of the `submission` subdirectory with their own implementation. Submitters must NOT change anything under the `harness` subdirectory. Any changes to the harness must be done by communicating with the benchmarking suite organizers.
3. Update the README with all relevant information, and optionally provide more documentation in the `docs` subdirectory.

Once the submission is complete, submitters should inform the benchmarking suite organizers by email and make their fork of the relevant repository public. The organizers will then incorporate the performance results from that submission into a table of results for the relevant workload, and include in that table a link to the submitter's fork.

## Contact & Resources

### Get in Touch

For questions, submissions, or to get involved:
**Email:** [benchmarking@homomorphicencryption.org](mailto:benchmarking@homomorphicencryption.org)

### Learn More

Visit the Homomorphic Encryption Standardization community:
[homomorphicencryption.org](https://homomorphicencryption.org)

---

[Code of Conduct](./CODE_OF_CONDUCT.html) | © 2025 [HomomorphicEncryption.org](https://homomorphicencryption.org)
