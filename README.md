# FHE Benchmarking Suite

**Measuring Performance of Computing on Encrypted Data**

## About the FHE Benchmarking Suite

This Benchmarking Suite provides standardized workloads and metrics to help application developers evaluate whether FHE is feasible for their use cases. Our goal is to enable informed decisions about deploying FHE solutions, by providing comprehensive performance data across different workloads, implementations, and platforms.

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

- [**Fetch-by-Similarity**](./fetch-by-similarity/index.html). Private database queries using cosine similarity search over encrypted data.

- [**ML Inference**](./ml-inference/index.html). Privacy-preserving machine learning inference on encrypted inputs. Currently features MNIST digit classification, with other models to come.

- [**Zn Multiplication**](./Zn-multiplication/index.html). Multiplication of two encrypted 64-bit encrypted integers. Other bit-sizes for the multiplicands will be added.

*Additional workloads are under development. Check back for updates.*

## Suite Structure

The benchmarking suite is organized around a set of git repositories under [github.com/fhe-benchmarking](https://github.com/fhe-benchmarking).

Each workload repository includes a `harness` subdirectory (provided by us), and a `submission` (or `submission_remote`) subdirectory that submitters populate with their solution.

### Submission Directory Content

- **Open-source software submission:** The `submission/` subdirectory must contain the complete implementation code.
- **Hardware-based submission:** The `submission_remote/` subdirectory must contain shims for communicating with the backend where most of the actual implementation resides. The cryptographic parameters and encryption/decryption code should be public even for those submissions.
- **Closed-source software:** Can either use shims in `submission_remote/` with backend implementation (as for hardware), or include a pre-compiled library or container with shims in `submission/` that call them.

Core workload computation must be performed on encrypted data, though pre-processing before encryption and post-processing after decryption are permitted. Submitters must explicitly document these steps, if they are used.

For consistent comparisons, software-only submissions should be tested on similar platforms. Currently (2026) we recommend platforms with 5th-gen Intel Xeon (Emerald Rapids), with 96 vCPUs and ample memory. Examples of such platforms include EC2 I7ie.24xl, GCP c4-highmem-96, and Azure Standard-E96s-v6. (Submitters may want to use "metal" instances to avoid noisy-neighbor issues.) Submissions that rely on accelerated computing should specify the acceleration hardware used (e.g., number and type of GPUs).

## How to Submit Solutions

When implementing one of the workloads from the benchmarking suite, submitters must:

1. Fork the relevant repository under [github.com/fhe-benchmarking](https://github.com/fhe-benchmarking)
2. Replace the content of the `submission/` or `submission_remote/` subdirectories with their own implementation. Submitters must NOT change anything under the `harness` subdirectory. Any changes to the harness must be done by communicating with the benchmarking suite organizers.
3. Generate measurements files by (a) removing previous measurement files (if any) and then (b) running the harness with a `--num_runs 3` argument. This will place three files `results-<n>.json` at the subdirectory corresponding to the variant being measured. Once you measured all the variants that you want to submit, commit all these measurement files to your fork.
4. Update the README with all relevant information, and optionally provide more documentation in the `docs` subdirectory.

Once the submission is complete, submitters should inform the benchmarking suite organizers by filing [this Google form](https://docs.google.com/forms/d/e/1FAIpQLSdZfqKcBTbzWBIToidfJCEFGUDJhQUEnLO8m0NGAypLO0BC2Q/viewform), and make their fork of the relevant repository public. The organizers will then incorporate the performance results from that submission into a table of results for the relevant workload, and include in that table a link to the submitter's fork.

### Security Requirements

Workloads must be encrypted with parameters supporting **at least 128-bit security**. Submitters must specify why they believe their submission provides the required security level.

### Documentation Requirements

Submitters must update the README file with instructions on how to run their workload.

- If a backend is required, the README must include procedures for obtaining access to that backend. *Backends should remain available for at least a few weeks following initial submission* to allow result replication. Submitters are *not* required to provide access to everyone, but are expected to allow reasonable validation of their claimed performance.
- The README must also include a description of how the solution works, FHE scheme(s) and parameters, and why this implementation enjoys at least 128-bit security. (Alternatively, the README can reference external documentation where this is described.)

## Contact & Resources

### Get in Touch

For questions or to get involved:
**Email:** [fhe-benchmarking@homomorphicencryption.org](mailto:fhe-benchmarking@homomorphicencryption.org)

### Learn More

Visit the Homomorphic Encryption Standardization community:
[homomorphicencryption.org](https://homomorphicencryption.org)

### Organizers
Andreea Alexandru, Flavio Bergamaschi, Shruthi Gorantala, Shai Halevi

### Participants
| | | | | |
| :---: | :---: | :---: | :---: | :---: |
| <img src="images/aws-logo.png" height="60"> | <img src="images/google-logo.png" height="60"> | <img src="images/duality-logo.png" height="45"> | <img src="images/optalysis-logo.png" height="60"> |  <img src="images/lattica-logo.png" height="45"> |
---

[Code of Conduct](./CODE_OF_CONDUCT.html) | © 2026 [HomomorphicEncryption.org](https://homomorphicencryption.org) | Last updated 2026-02-13
