import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Copy, Check, FileText, BookOpen, Github, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';

const papers = [
  {
    id: 'scd-v31',
    title: 'Structured Contextual Distillation (SCD v3.1)',
    subtitle: 'A Deterministic, Vendor-Independent Protocol for Persistent, Verifiable Agent State',
    author: 'Paul Desai',
    date: 'December 2, 2025',
    doi: '10.5281/zenodo.17787619',
    zenodoUrl: 'https://zenodo.org/records/17787619',
    metrics: { views: 156, downloads: 119 },
    abstract: 'Introduces a deterministic protocol for AI state persistence that works across vendors and sessions. Defines hash-based integrity verification and structured context encoding.',
    tags: ['Protocol', 'State Management', 'Verification'],
    bibtex: `@article{desai2025scd,
  title={Structured Contextual Distillation (SCD v3.1): A Deterministic, Vendor-Independent Protocol for Persistent, Verifiable Agent State},
  author={Desai, Paul},
  journal={Zenodo},
  year={2025},
  doi={10.5281/zenodo.17787619}
}`
  },
  {
    id: 'governance-reflective',
    title: 'Governance and Boundary Conditions for Reflective AI Systems',
    subtitle: 'Structural Enforcement Beyond Prompt Alignment',
    author: 'Paul Desai',
    date: 'December 17, 2025',
    doi: '10.5281/zenodo.18212080',
    zenodoUrl: 'https://doi.org/10.5281/zenodo.18212080',
    aixiv: 'aixiv.251217.000002',
    aixivUrl: 'https://aixiv.science/abs/aixiv.251217.000002',
    abstract: 'Proposes structural enforcement mechanisms for reflective AI systems that go beyond prompt-based alignment. Introduces the MirrorGate control plane architecture.',
    tags: ['Governance', 'Safety', 'Architecture'],
    bibtex: `@article{desai2025governance,
  title={Governance and Boundary Conditions for Reflective AI Systems: Structural Enforcement Beyond Prompt Alignment},
  author={Desai, Paul},
  journal={Zenodo},
  year={2025},
  doi={10.5281/zenodo.18212080}
}`
  },
  {
    id: 'layered-governance',
    title: 'Layered Governance for Large Language Model Systems',
    subtitle: 'Separating Structural Authority Enforcement from Content Safety',
    author: 'Paul Desai',
    date: 'December 18, 2025',
    doi: '10.5281/zenodo.18212082',
    zenodoUrl: 'https://doi.org/10.5281/zenodo.18212082',
    aixiv: 'aixiv.251218.000003',
    aixivUrl: 'https://aixiv.science/abs/aixiv.251218.000003',
    codeUrl: 'https://github.com/MirrorDNA-Reflection-Protocol/ActiveMirrorOS/tree/main/src/amgl_guard',
    datasetUrl: 'https://github.com/MirrorDNA-Reflection-Protocol/ActiveMirrorOS/tree/main/eval/datasets',
    abstract: 'Demonstrates separation of structural authority enforcement from content safety layers. Includes 130-case evaluation dataset and production-grade implementation.',
    tags: ['Governance', 'Evaluation', 'Implementation'],
    bibtex: `@article{desai2025layered,
  title={Layered Governance for Large Language Model Systems: Separating Structural Authority Enforcement from Content Safety},
  author={Desai, Paul},
  journal={Zenodo},
  year={2025},
  doi={10.5281/zenodo.18212082}
}`
  }
];

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
    >
      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied!' : label}
    </button>
  );
}

function PaperCard({ paper }) {
  const [showBibtex, setShowBibtex] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
    >
      <div className="flex flex-wrap gap-2 mb-3">
        {paper.tags.map(tag => (
          <span key={tag} className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded-full">
            {tag}
          </span>
        ))}
      </div>

      <h3 className="text-lg font-semibold text-white mb-1">{paper.title}</h3>
      <p className="text-sm text-gray-400 mb-3">{paper.subtitle}</p>

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
        <span>{paper.author}</span>
        <span>{paper.date}</span>
        {paper.metrics && (
          <span className="text-purple-400">
            {paper.metrics.views} views · {paper.metrics.downloads} downloads
          </span>
        )}
      </div>

      <p className="text-sm text-gray-300 mb-4">{paper.abstract}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <a
          href={paper.zenodoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors"
        >
          <FileText className="w-3 h-3" />
          Zenodo
          <ExternalLink className="w-3 h-3" />
        </a>

        {paper.aixivUrl && (
          <a
            href={paper.aixivUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors"
          >
            <BookOpen className="w-3 h-3" />
            aiXiv
            <ExternalLink className="w-3 h-3" />
          </a>
        )}

        {paper.codeUrl && (
          <a
            href={paper.codeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 rounded-lg transition-colors"
          >
            <Github className="w-3 h-3" />
            Code
            <ExternalLink className="w-3 h-3" />
          </a>
        )}

        <button
          onClick={() => setShowBibtex(!showBibtex)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Quote className="w-3 h-3" />
          {showBibtex ? 'Hide' : 'Show'} BibTeX
        </button>
      </div>

      {showBibtex && (
        <div className="mt-4 p-4 bg-black/30 rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs text-gray-500">BibTeX Citation</span>
            <CopyButton text={paper.bibtex} label="Copy" />
          </div>
          <pre className="text-xs text-gray-400 overflow-x-auto whitespace-pre-wrap font-mono">
            {paper.bibtex}
          </pre>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">DOI:</span>
          <code className="text-xs text-purple-400">{paper.doi}</code>
          <CopyButton text={paper.doi} label="Copy DOI" />
        </div>
      </div>
    </motion.div>
  );
}

export default function Research() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Active Mirror
          </Link>

          <h1 className="text-4xl font-bold mb-4">
            <span className="text-purple-400">⟡</span> Research
          </h1>
          <p className="text-lg text-gray-400">
            Peer-reviewed publications on sovereign AI infrastructure, memory protocols,
            and governance systems.
          </p>
        </div>

        {/* Papers */}
        <div className="space-y-6 mb-16">
          {papers.map(paper => (
            <PaperCard key={paper.id} paper={paper} />
          ))}
        </div>

        {/* How to Cite */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-semibold mb-4">How to Cite</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-purple-400 mb-2">Citing MirrorDNA Protocol</h3>
              <div className="p-4 bg-black/30 rounded-lg">
                <p className="text-sm text-gray-300 mb-2">
                  Desai, P. (2025). Structured Contextual Distillation (SCD v3.1): A Deterministic,
                  Vendor-Independent Protocol for Persistent, Verifiable Agent State.
                  Zenodo. https://doi.org/10.5281/zenodo.17787619
                </p>
                <CopyButton
                  text="Desai, P. (2025). Structured Contextual Distillation (SCD v3.1). Zenodo. https://doi.org/10.5281/zenodo.17787619"
                  label="Copy Citation"
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-purple-400 mb-2">Citing MirrorGate Governance</h3>
              <div className="p-4 bg-black/30 rounded-lg">
                <p className="text-sm text-gray-300 mb-2">
                  Desai, P. (2025). Governance and Boundary Conditions for Reflective AI Systems.
                  Zenodo. https://doi.org/10.5281/zenodo.18212080
                </p>
                <CopyButton
                  text="Desai, P. (2025). Governance and Boundary Conditions for Reflective AI Systems. Zenodo. https://doi.org/10.5281/zenodo.18212080"
                  label="Copy Citation"
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-purple-400 mb-2">Citing Active Mirror</h3>
              <div className="p-4 bg-black/30 rounded-lg">
                <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap">
{`@software{activemirror2025,
  author = {Desai, Paul},
  title = {Active MirrorOS: Sovereign AI Operating System},
  year = {2025},
  publisher = {N1 Intelligence},
  url = {https://activemirror.ai}
}`}
                </pre>
                <div className="mt-2">
                  <CopyButton
                    text={`@software{activemirror2025,
  author = {Desai, Paul},
  title = {Active MirrorOS: Sovereign AI Operating System},
  year = {2025},
  publisher = {N1 Intelligence},
  url = {https://activemirror.ai}
}`}
                    label="Copy BibTeX"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-gray-500">
          <p className="mb-2">
            All research by{' '}
            <a href="https://pauldesai.me" className="text-purple-400 hover:underline">
              Paul Desai
            </a>
            {' '}at{' '}
            <a href="https://n1intelligence.com" className="text-purple-400 hover:underline">
              N1 Intelligence
            </a>
          </p>
          <p>
            <span className="text-purple-400">⟡</span> Reflection over prediction
          </p>
        </div>
      </div>
    </div>
  );
}
