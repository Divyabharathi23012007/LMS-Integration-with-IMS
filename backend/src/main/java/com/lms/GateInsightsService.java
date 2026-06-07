package com.lms.service;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class GateInsightsService {

    public record Topic(String name, int marks, List<String> subtopics) {}
    public record PYQ(String year, String question, List<String> options, String answer, String explanation) {}
    public record Resource(String title, String url, String type) {}
    public record GateInsight(
        String subject, String gateCode, int totalMarks,
        List<Topic> syllabus, List<PYQ> pyqs, List<Resource> resources,
        List<String> importantTopics, String examPattern
    ) {}

    public GateInsight getInsightForCourse(String courseName, String courseCode) {
        String key = (courseName + " " + courseCode).toLowerCase();

        if (matches(key, "operating system", "os"))
            return osInsight();
        if (matches(key, "theory of computation", "toc", "automata", "formal language"))
            return tocInsight();
        if (matches(key, "database", "dbms"))
            return dbmsInsight();
        if (matches(key, "design and analysis", "daa", "algorithm analysis", "analysis of algorithm"))
            return daaInsight();
        if (matches(key, "software development", "software engineering", "sdlc", "software design"))
            return softwareDevInsight();
        if (matches(key, "machine learning", "ml", "deep learning", "neural network", "artificial intelligence"))
            return mlInsight();

        return null;
    }

    private boolean matches(String key, String... keywords) {
        return Arrays.stream(keywords).anyMatch(key::contains);
    }

    private GateInsight osInsight() {
        return new GateInsight(
            "Operating Systems", "CS", 100,
            List.of(
                new Topic("Process Management", 10, List.of("Process states & transitions", "PCB", "Context switching", "Threads vs processes")),
                new Topic("CPU Scheduling", 8, List.of("FCFS, SJF, SRTF", "Round Robin", "Priority scheduling", "Multilevel queue")),
                new Topic("Synchronization & Deadlock", 12, List.of("Critical section problem", "Semaphores & monitors", "Deadlock conditions", "Banker's algorithm")),
                new Topic("Memory Management", 12, List.of("Paging & segmentation", "Virtual memory", "Page replacement (LRU, FIFO, Optimal)", "Thrashing")),
                new Topic("File Systems", 6, List.of("File allocation methods", "Directory structures", "Disk scheduling (SSTF, SCAN)")),
                new Topic("I/O Management", 4, List.of("Buffering & spooling", "DMA", "Device drivers"))
            ),
            List.of(
                new PYQ("GATE 2024", "Which page replacement algorithm suffers from Belady's anomaly?",
                    List.of("LRU", "Optimal", "FIFO", "LFU"), "C",
                    "FIFO suffers from Belady's anomaly — increasing frames can actually increase page faults."),
                new PYQ("GATE 2023", "Banker's algorithm is used for:",
                    List.of("Deadlock prevention", "Deadlock avoidance", "Deadlock detection", "Deadlock recovery"), "B",
                    "Banker's algorithm avoids deadlock by checking if granting a resource keeps the system in a safe state."),
                new PYQ("GATE 2022", "In round robin scheduling with time quantum q, if a process burst time < q, it:",
                    List.of("Waits for next quantum", "Releases CPU voluntarily", "Is preempted", "Goes to blocked state"), "B",
                    "If a process finishes before the quantum expires, it voluntarily releases the CPU."),
                new PYQ("GATE 2021", "Which of the following is NOT a necessary condition for deadlock?",
                    List.of("Mutual exclusion", "Hold and wait", "Preemption", "Circular wait"), "C",
                    "The 4 necessary conditions are mutual exclusion, hold and wait, NO preemption, and circular wait. Preemption breaks deadlock.")
            ),
            List.of(
                new Resource("OS PYQs - GeeksforGeeks", "https://www.geeksforgeeks.org/gate/operating-system-gq/", "Practice"),
                new Resource("OS NPTEL Lectures", "https://nptel.ac.in/courses/106105080", "Video"),
                new Resource("GATE CS Previous Papers", "https://margdarshanprep.com/pyq/gate-pyq.html", "Papers")
            ),
            List.of("Page replacement algorithms", "CPU scheduling numericals", "Deadlock & Banker's algorithm", "Semaphores", "Virtual memory"),
            "4–6 questions (8–10 marks) in GATE CS. Scheduling and memory management numericals appear every year."
        );
    }

    private GateInsight tocInsight() {
        return new GateInsight(
            "Theory of Computation", "CS", 100,
            List.of(
                new Topic("Finite Automata", 12, List.of("DFA construction & minimization", "NFA to DFA conversion", "Regular expressions", "Equivalence")),
                new Topic("Regular Languages", 8, List.of("Pumping lemma for RL", "Closure properties", "Decision problems")),
                new Topic("Context-Free Languages", 12, List.of("CFG derivations", "Ambiguity", "PDA", "CFL pumping lemma", "CNF/GNF")),
                new Topic("Turing Machines", 10, List.of("TM design", "Variants (multi-tape, NTM)", "Church-Turing thesis")),
                new Topic("Decidability", 8, List.of("Decidable vs undecidable problems", "Halting problem", "Rice's theorem", "Reductions")),
                new Topic("Complexity", 6, List.of("P vs NP", "NP-hard vs NP-complete", "Polynomial-time reduction"))
            ),
            List.of(
                new PYQ("GATE 2024", "Minimum number of states in DFA accepting strings over {0,1} ending in '01':",
                    List.of("2", "3", "4", "5"), "B",
                    "3 states: q0 (start), q1 (seen 0), q2 (seen 01, accept). From q2 on '0' go to q1, on '1' go to q0."),
                new PYQ("GATE 2023", "Which language is NOT context-free?",
                    List.of("{ aⁿbⁿ | n≥1 }", "{ aⁿbⁿcⁿ | n≥1 }", "{ wwᴿ | w∈{a,b}* }", "{ aⁿbᵐ | n≤m }"), "B",
                    "aⁿbⁿcⁿ requires counting three symbols simultaneously — not possible with a PDA."),
                new PYQ("GATE 2022", "The Halting Problem is:",
                    List.of("Decidable", "Semidecidable (RE)", "Not RE", "In P"), "B",
                    "The Halting Problem is RE but not recursive — a TM can confirm 'yes' but may loop forever on 'no'."),
                new PYQ("GATE 2021", "By Rice's theorem, which property of TMs is decidable?",
                    List.of("L(M) is empty", "L(M) is finite", "M has exactly 5 states", "L(M) = Σ*"), "C",
                    "Rice's theorem applies only to semantic properties (about L(M)). Number of states is a syntactic/structural property — decidable.")
            ),
            List.of(
                new Resource("TOC PYQs - GeeksforGeeks", "https://www.geeksforgeeks.org/gate/theory-of-computation-gq/", "Practice"),
                new Resource("TOC NPTEL Lectures", "https://nptel.ac.in/courses/106105081", "Video"),
                new Resource("GATE CS Previous Papers", "https://margdarshanprep.com/pyq/gate-pyq.html", "Papers")
            ),
            List.of("DFA minimization", "NFA to DFA conversion", "CFL & pumping lemma", "Decidability & Rice's theorem", "NP-completeness"),
            "5–6 questions (8–10 marks) in GATE CS. Highly conceptual — practice drawing automata on paper."
        );
    }

    private GateInsight dbmsInsight() {
        return new GateInsight(
            "Database Management Systems", "CS", 100,
            List.of(
                new Topic("ER Model & Relational Model", 6, List.of("ER to relational mapping", "Keys (primary, foreign, candidate)", "Relational algebra")),
                new Topic("SQL", 8, List.of("Joins (inner, outer, natural)", "Subqueries & correlated queries", "Aggregation & GROUP BY", "Views & triggers")),
                new Topic("Normalization", 10, List.of("Functional dependencies", "1NF, 2NF, 3NF, BCNF", "Decomposition (lossless, dependency preserving)")),
                new Topic("Transactions & Concurrency", 10, List.of("ACID properties", "Serializability (conflict, view)", "2-Phase Locking", "Deadlock in DBMS")),
                new Topic("Indexing", 6, List.of("B+ tree structure & operations", "Dense vs sparse indexes", "Hash-based indexing")),
                new Topic("Query Processing", 4, List.of("Query optimization", "Cost estimation", "Join algorithms"))
            ),
            List.of(
                new PYQ("GATE 2024", "Relation R(A,B,C) with FDs A→B and B→C. Candidate key of R is:",
                    List.of("A only", "B only", "A and B", "A, B and C"), "A",
                    "A→B→C, so A determines all attributes. A is the only candidate key."),
                new PYQ("GATE 2023", "2-Phase Locking (2PL) guarantees:",
                    List.of("Deadlock freedom", "Conflict serializability", "View serializability", "Recoverability"), "B",
                    "2PL guarantees conflict serializability. It does NOT prevent deadlocks."),
                new PYQ("GATE 2022", "In a B+ tree of order m, the minimum number of keys in a non-root internal node is:",
                    List.of("⌈m/2⌉", "⌊m/2⌋", "⌈m/2⌉ − 1", "⌊m/2⌋ − 1"), "C",
                    "Non-root internal nodes must have at least ⌈m/2⌉ children → ⌈m/2⌉ − 1 keys."),
                new PYQ("GATE 2021", "Which normal form eliminates all partial dependencies?",
                    List.of("1NF", "2NF", "3NF", "BCNF"), "B",
                    "2NF removes partial dependencies (non-prime attribute depending on part of a composite key).")
            ),
            List.of(
                new Resource("DBMS PYQs - GeeksforGeeks", "https://www.geeksforgeeks.org/gate/dbms-gq/", "Practice"),
                new Resource("DBMS NPTEL Lectures", "https://nptel.ac.in/courses/106105175", "Video"),
                new Resource("GATE CS Previous Papers", "https://margdarshanprep.com/pyq/gate-pyq.html", "Papers")
            ),
            List.of("Normalization (BCNF)", "Conflict serializability", "B+ tree operations", "SQL joins & subqueries", "Functional dependencies"),
            "3–4 questions (5–7 marks) in GATE CS. Normalization and transactions appear every single year."
        );
    }

    private GateInsight daaInsight() {
        return new GateInsight(
            "Design and Analysis of Algorithms", "CS", 100,
            List.of(
                new Topic("Algorithm Analysis", 10, List.of("Asymptotic notations (O, Ω, Θ)", "Recurrence relations", "Master theorem", "Space complexity")),
                new Topic("Divide and Conquer", 10, List.of("Merge sort", "Quick sort analysis", "Binary search", "Strassen's matrix multiplication")),
                new Topic("Greedy Algorithms", 10, List.of("Activity selection", "Huffman coding", "Kruskal's & Prim's MST", "Dijkstra's SSSP")),
                new Topic("Dynamic Programming", 14, List.of("0/1 Knapsack", "LCS & LIS", "Matrix chain multiplication", "Bellman-Ford", "Floyd-Warshall")),
                new Topic("Graph Algorithms", 10, List.of("BFS/DFS applications", "Topological sort", "Strongly connected components", "Network flow")),
                new Topic("NP-Completeness", 6, List.of("P vs NP", "NP-hard vs NP-complete", "Reductions", "Classic NP problems"))
            ),
            List.of(
                new PYQ("GATE 2024", "Time complexity of building a max-heap from an unsorted array of n elements:",
                    List.of("O(n log n)", "O(n)", "O(log n)", "O(n²)"), "B",
                    "Bottom-up heapify runs in O(n) — the sum of heights at each level converges to a linear bound."),
                new PYQ("GATE 2023", "T(n) = 2T(n/2) + n log n. By Master Theorem, T(n) is:",
                    List.of("O(n)", "O(n log n)", "O(n log² n)", "O(n²)"), "C",
                    "a=2, b=2, f(n)=n log n. n^log₂2 = n. f(n) grows faster than n but not polynomially → T(n) = Θ(n log² n)."),
                new PYQ("GATE 2022", "Dijkstra's algorithm does NOT work correctly when:",
                    List.of("Graph has cycles", "Graph is disconnected", "Edges have negative weights", "Graph is dense"), "C",
                    "Dijkstra's greedy relaxation breaks with negative edges. Use Bellman-Ford for negative weights."),
                new PYQ("GATE 2021", "In 0/1 knapsack DP with n items and capacity W, time complexity is:",
                    List.of("O(n)", "O(W)", "O(nW)", "O(n²)"), "C",
                    "Standard DP fills an n×W table, giving O(nW) time and space.")
            ),
            List.of(
                new Resource("Algorithms PYQs - GeeksforGeeks", "https://www.geeksforgeeks.org/gate/algorithms-gq/", "Practice"),
                new Resource("DAA NPTEL Lectures", "https://nptel.ac.in/courses/106102064", "Video"),
                new Resource("GATE CS Previous Papers", "https://margdarshanprep.com/pyq/gate-pyq.html", "Papers")
            ),
            List.of("Dynamic programming (DP tables)", "Master theorem (recurrences)", "Greedy proofs (MST, Dijkstra)", "Graph algorithms (SCC, topo sort)", "NP-completeness reductions"),
            "8–10 questions (14–18 marks) in GATE CS. Highest-weightage technical subject — DP and graph problems dominate."
        );
    }

    private GateInsight softwareDevInsight() {
        return new GateInsight(
            "Software Development / Software Engineering", "CS", 100,
            List.of(
                new Topic("SDLC Models", 6, List.of("Waterfall model", "Agile & Scrum", "Spiral model", "Prototype model", "V-model")),
                new Topic("Requirements Engineering", 4, List.of("Functional vs non-functional", "Use case diagrams", "SRS document")),
                new Topic("Software Design", 8, List.of("Cohesion & coupling types", "Design patterns (creational, structural, behavioral)", "UML diagrams")),
                new Topic("Testing", 10, List.of("Black box vs white box testing", "Unit, integration, system testing", "Cyclomatic complexity", "Boundary value analysis")),
                new Topic("Project Management", 8, List.of("COCOMO model (basic, intermediate)", "Function point analysis", "Risk management", "Gantt & PERT charts")),
                new Topic("Software Quality", 4, List.of("CMM/CMMI levels", "Software metrics", "ISO standards", "Defect density"))
            ),
            List.of(
                new PYQ("GATE 2024", "Cyclomatic complexity V(G) for a CFG with E=12 edges, N=9 nodes, P=1 component:",
                    List.of("3", "4", "5", "6"), "C",
                    "V(G) = E − N + 2P = 12 − 9 + 2 = 5."),
                new PYQ("GATE 2023", "Which SDLC model explicitly includes risk analysis in each iteration?",
                    List.of("Waterfall", "V-model", "Spiral", "Agile"), "C",
                    "Spiral model has four phases per iteration: planning, risk analysis, engineering, evaluation."),
                new PYQ("GATE 2022", "In COCOMO basic model, effort E = a × (KLOC)^b. For organic projects (a, b) is:",
                    List.of("(2.4, 1.05)", "(3.0, 1.12)", "(3.6, 1.20)", "(1.0, 1.00)"), "A",
                    "COCOMO constants: Organic (2.4, 1.05), Semi-detached (3.0, 1.12), Embedded (3.6, 1.20)."),
                new PYQ("GATE 2021", "Which coupling type is the MOST desirable (loosest)?",
                    List.of("Content coupling", "Common coupling", "Data coupling", "Control coupling"), "C",
                    "Data coupling (passing only required data as parameters) is the loosest and most desirable.")
            ),
            List.of(
                new Resource("SE PYQs - GeeksforGeeks", "https://www.geeksforgeeks.org/gate/software-engineering-gq/", "Practice"),
                new Resource("Software Engineering NPTEL", "https://nptel.ac.in/courses/106105087", "Video"),
                new Resource("GATE CS Previous Papers", "https://margdarshanprep.com/pyq/gate-pyq.html", "Papers")
            ),
            List.of("Cyclomatic complexity", "COCOMO estimation", "Cohesion & coupling", "Testing techniques", "SDLC model selection"),
            "2–3 questions (3–5 marks) in GATE CS. Cyclomatic complexity and COCOMO appear almost every year."
        );
    }

    private GateInsight mlInsight() {
        return new GateInsight(
            "Machine Learning", "CS / GATE DA", 100,
            List.of(
                new Topic("Supervised Learning", 14, List.of("Linear & logistic regression", "Decision trees & Random forests", "SVM", "K-nearest neighbors", "Bias-variance tradeoff")),
                new Topic("Unsupervised Learning", 10, List.of("K-means clustering", "Hierarchical clustering", "PCA & dimensionality reduction", "EM algorithm")),
                new Topic("Neural Networks", 12, List.of("Perceptron & MLP", "Backpropagation", "Activation functions (ReLU, sigmoid, tanh)", "CNN & RNN basics")),
                new Topic("Model Evaluation", 8, List.of("Precision, recall, F1-score", "ROC & AUC", "Cross-validation", "Confusion matrix")),
                new Topic("Probability & Statistics for ML", 8, List.of("Bayes theorem", "Naive Bayes classifier", "MLE & MAP estimation", "Bayesian networks")),
                new Topic("Optimization", 6, List.of("Gradient descent variants (SGD, Adam)", "Regularization (L1, L2)", "Overfitting & underfitting", "Hyperparameter tuning"))
            ),
            List.of(
                new PYQ("GATE DA 2024", "In logistic regression, the output activation function is:",
                    List.of("ReLU", "Sigmoid", "Softmax", "Tanh"), "B",
                    "Logistic regression uses sigmoid σ(z) = 1/(1+e⁻ᶻ) to produce probabilities between 0 and 1."),
                new PYQ("GATE DA 2023", "Which of the following reduces overfitting in a neural network?",
                    List.of("Increasing model complexity", "More training epochs", "Dropout regularization", "Removing validation set"), "C",
                    "Dropout randomly deactivates neurons during training, acting as regularization to reduce overfitting."),
                new PYQ("GATE DA 2023", "K-means clustering minimizes:",
                    List.of("Inter-cluster distance", "Within-cluster sum of squares (WCSS)", "Number of clusters", "Maximum distance to centroid"), "B",
                    "K-means objective is to minimize WCSS — sum of squared distances from each point to its cluster centroid."),
                new PYQ("GATE DA 2022", "The bias-variance tradeoff states that as model complexity increases:",
                    List.of("Both bias and variance increase", "Bias increases, variance decreases", "Bias decreases, variance increases", "Both decrease"), "C",
                    "More complex models fit training data better (lower bias) but are sensitive to noise (higher variance).")
            ),
            List.of(
                new Resource("ML PYQs - GeeksforGeeks", "https://www.geeksforgeeks.org/gate/machine-learning-gq/", "Practice"),
                new Resource("ML NPTEL Course", "https://nptel.ac.in/courses/106106139", "Video"),
                new Resource("GATE DA Previous Papers", "https://margdarshanprep.com/pyq/gate-pyq.html", "Papers")
            ),
            List.of("Bias-variance tradeoff", "Backpropagation math", "K-means & clustering", "Naive Bayes classifier", "Regularization (L1/L2)"),
            "Core subject in GATE DA (Data Science & AI). Also tested in GATE CS. Increasingly weighted in recent years."
        );
    }
}
