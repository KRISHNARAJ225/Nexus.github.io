import React, { useState } from 'react';
import { 
  HelpCircle, 
  Book, 
  MessageSquare, 
  Search, 
  LayoutDashboard, 
  ReceiptText, 
  Users, 
  ChevronDown, 
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Zap,
  Mail,
  Phone,
  ArrowRight
} from 'lucide-react';

const HelpPage = () => {
  const [activeTab, setActiveTab] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      question: "How do I add a new transaction?",
      answer: "Go to the Transactions page and click the 'Add Transaction' button. Fill in the customer details, products, and payment status, then save.",
      category: "transactions"
    },
    {
      question: "Can I export my customer data?",
      answer: "Yes, on the Customer page, you can find an 'Export' button in the top right corner to download your customer list in CSV format.",
      category: "customers"
    },
    {
      question: "How are the dashboard charts calculated?",
      answer: "The charts are calculated in real-time based on your transaction history. The Sales Performance chart shows revenue trends over months, while the Pie chart displays your most used payment methods.",
      category: "dashboard"
    },
    {
      question: "What does 'Payment Status: Pending' mean?",
      answer: "It means the order has been created but the payment hasn't been confirmed yet. You can update this status later by editing the transaction.",
      category: "transactions"
    },
    {
    "question": "How do I generate a GST-compliant invoice?",
    "answer": "Go to the 'Completed Orders' section, select your order, and click 'Generate Invoice'. Ensure your GSTIN is updated in your profile settings.",
    "category": "billing"
  },
  {
    "question": "What happens if a customer initiates a chargeback?",
    "answer": "The transaction status will move to 'Disputed'. You must upload proof of delivery or a signed manifest within 48 hours to resolve it.",
    "category": "transactions"
  },
  {
    "question": "How do I update the stock for a specific product?",
    "answer": "Navigate to the 'Inventory' tab, find your product, and enter the new quantity. The website will automatically update the 'In Stock' label.",
    "category": "inventory"
  },
  {
    "question": "How do I track a canceled order's refund status?",
    "answer": "In the 'Refunds' dashboard, search by Order ID. Statuses include 'Initiated', 'Processed by Bank', and 'Completed'.",
    "category": "transactions"
  },
  {
    "question": "How do I add a new shipping partner to the system?",
    "answer": "Go to 'Settings' > 'Shipping Integrations' and enter your API keys for the desired courier service to enable real-time tracking.",
    "category": "shipping"
  },
 
  ];

  const filteredFaqs = faqs.filter(f => 
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const SectionCard = ({ icon: Icon, title, description, badge }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all group cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl group-hover:bg-blue-600 transition-colors">
          <Icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
        </div>
        {badge && (
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
      <div className="mt-4 flex items-center text-blue-600 dark:text-blue-400 text-sm font-bold gap-1 opacity-0 group-hover:opacity-100 transition-all">
        Learn more <ArrowRight className="w-4 h-4" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-3xl p-8 mb-8 border border-slate-100 dark:border-slate-700">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl mb-6">
            <HelpCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            How can we <span className="text-blue-600">help you</span> today?
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
            Find answers to common questions, explore detailed documentation, or reach out to our dedicated support team.
          </p>
          
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search help articles, FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 dark:text-white transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Quick Access Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <SectionCard 
          icon={LayoutDashboard} 
          title="Dashboard Analytics" 
          description="Understand how your sales, revenue, and inventory metrics are visualized in real-time."
          badge="Updated"
        />
        <SectionCard 
          icon={ReceiptText} 
          title="Transactions" 
          description="Learn how to manage orders, update payment statuses, and track your daily sales volume."
        />
        <SectionCard 
          icon={Users} 
          title="Customer CRM" 
          description="A guide on managing your customer database, tracking history, and building relationships."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: FAQs */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-gray-400 mb-6 flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {filteredFaqs.map((faq, idx) => (
                <div 
                  key={idx}
                  className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm hover:border-blue-200 transition-colors"
                >
                  <button 
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left"
                  >
                    <span className="font-bold text-slate-800 dark:text-white">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-6 text-sm text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-700 pt-4">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
              {filteredFaqs.length === 0 && (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <p className="text-slate-500">No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Contact & Info */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 p-8 rounded-3xl text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            <h3 className="text-xl font-bold mb-2">Still need help?</h3>
            <p className="text-blue-100 text-sm mb-6 leading-relaxed relative z-10">
              Our support team is available during business hours to assist you with any technical issues or account questions.
            </p>
            <div className="space-y-4 relative z-10">
              <a href="mailto:support@shopsy.com" className="flex items-center gap-3 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all border border-white/10 group">
                <Mail className="w-5 h-5" />
                <span className="text-sm font-bold">support@shopsy.com</span>
                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all" />
              </a>
              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/10">
                <Phone className="w-5 h-5" />
                <span className="text-sm font-bold">91+ 9876543210</span>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex items-center gap-2 mb-3">
                    <Book className="w-4 h-4 text-blue-200" />
                    <span className="text-xs font-bold text-blue-100 uppercase tracking-widest">Working Hours</span>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-blue-200">Monday - Friday</span>
                        <span className="font-bold">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-blue-200">Saturday</span>
                        <span className="font-bold">10:00 AM - 2:00 PM</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-blue-200">Sunday</span>
                        <span className="text-blue-300 italic">Closed</span>
                    </div>
                </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <h4 className="font-bold text-slate-800 dark:text-white mb-4">Quick Resources</h4>
            <div className="space-y-3">
              {[
                { label: 'Platform Status', icon: Zap, status: 'Operational' },
                { label: 'Security Overview', icon: ShieldCheck },
                { label: 'Developer API', icon: Book },
              ].map((res, i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-xl transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <res.icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{res.label}</span>
                  </div>
                  {res.status ? (
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      {res.status}
                    </span>
                  ) : <ExternalLink className="w-3 h-3 text-slate-300" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
