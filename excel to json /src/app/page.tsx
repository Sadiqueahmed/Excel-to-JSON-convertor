"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  History, 
  Trash2, 
  Eye, 
  Copy, 
  Check, 
  FileJson,
  Clock,
  HardDrive,
  Layers,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
  FileCode,
  Table,
  CheckCircle2,
  Github
} from "lucide-react";
import { toast } from "sonner";

interface ConversionRecord {
  id: string;
  originalFileName: string;
  fileSize: number;
  sheetsCount: number;
  jsonData: string;
  createdAt: string;
}

export default function ExcelToJsonConverter() {
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedData, setConvertedData] = useState<Record<string, unknown[]> | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [history, setHistory] = useState<ConversionRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [copied, setCopied] = useState(false);
  const [viewingHistoryId, setViewingHistoryId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("converter");

  const fetchHistory = useCallback(async () => {
    try {
      const response = await fetch("/api/history");
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch {
      toast.error("Failed to load history");
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  }, []);

  const processFile = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error("Please upload an Excel file (.xlsx, .xls) or CSV file");
      return;
    }

    setIsConverting(true);
    setFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Conversion failed");
      }

      const result = await response.json();
      setConvertedData(result.data);
      setViewingHistoryId(null);
      setActiveTab("result");
      toast.success("File converted successfully!");
      fetchHistory();
    } catch {
      toast.error("Failed to convert file");
      setConvertedData(null);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedData) return;

    const blob = new Blob([JSON.stringify(convertedData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.replace(/\.(xlsx|xls|csv)$/i, ".json");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("JSON file downloaded!");
  };

  const handleCopy = async () => {
    if (!convertedData) return;

    await navigator.clipboard.writeText(JSON.stringify(convertedData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleViewHistory = (record: ConversionRecord) => {
    setConvertedData(JSON.parse(record.jsonData));
    setFileName(record.originalFileName);
    setViewingHistoryId(record.id);
    setActiveTab("result");
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      const response = await fetch(`/api/history/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setHistory(history.filter((h) => h.id !== id));
        if (viewingHistoryId === id) {
          setConvertedData(null);
          setFileName("");
          setViewingHistoryId(null);
        }
        toast.success("History deleted");
      }
    } catch {
      toast.error("Failed to delete history");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getSheetCount = (data: Record<string, unknown[]> | null) => {
    return data ? Object.keys(data).length : 0;
  };

  const getRowCount = (data: Record<string, unknown[]> | null) => {
    if (!data) return 0;
    return Object.values(data).reduce((sum, sheet) => sum + sheet.length, 0);
  };

  const totalConversions = history.length;
  const totalFilesProcessed = history.reduce((sum, h) => sum + 1, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 dark:from-emerald-500/5 dark:via-teal-500/3 dark:to-cyan-500/5" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDgyM0IiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        
        <div className="relative container mx-auto px-4 py-12 lg:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Fast & Secure Conversion</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
              Excel to JSON
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent"> Converter</span>
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
              Transform your spreadsheets into clean, structured JSON data instantly. 
              Support for multiple sheets, CSV files, and complete conversion history.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{totalConversions}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Conversions</div>
              </div>
              <div className="w-px h-12 bg-slate-200 dark:bg-slate-700" />
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">{history.reduce((sum, h) => sum + h.sheetsCount, 0)}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Sheets Processed</div>
              </div>
              <div className="w-px h-12 bg-slate-200 dark:bg-slate-700" />
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">100%</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">Free to Use</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="converter" className="gap-2">
              <Upload className="w-4 h-4" />
              Convert
            </TabsTrigger>
            <TabsTrigger value="result" className="gap-2" disabled={!convertedData}>
              <FileCode className="w-4 h-4" />
              Result
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Converter Tab */}
          <TabsContent value="converter" className="space-y-8">
            {/* Upload Section */}
            <Card className="max-w-2xl mx-auto border-2 border-dashed overflow-hidden">
              <div
                className={`p-12 transition-all duration-300 ${
                  isDragging
                    ? "bg-emerald-50 dark:bg-emerald-950/30 scale-[1.02]"
                    : "bg-white dark:bg-slate-900"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <div
                    className={`p-6 rounded-2xl mb-6 transition-all duration-300 ${
                      isDragging
                        ? "bg-emerald-200 dark:bg-emerald-800 scale-110"
                        : "bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700"
                    }`}
                  >
                    {isDragging ? (
                      <FileJson className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Upload className="w-12 h-12 text-slate-400 dark:text-slate-500" />
                    )}
                  </div>
                  <p className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">
                    {isDragging ? "Release to upload" : "Drop your Excel file here"}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    or click to browse from your computer
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge variant="secondary" className="font-normal">.xlsx</Badge>
                    <Badge variant="secondary" className="font-normal">.xls</Badge>
                    <Badge variant="secondary" className="font-normal">.csv</Badge>
                  </div>
                </label>
              </div>
            </Card>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 w-fit mb-3 group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <CardTitle className="text-lg">Lightning Fast</CardTitle>
                  <CardDescription>
                    Convert files in milliseconds with our optimized processing engine
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="p-3 rounded-xl bg-teal-100 dark:bg-teal-900/30 w-fit mb-3 group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <CardTitle className="text-lg">Secure & Private</CardTitle>
                  <CardDescription>
                    Your files are processed locally and never stored on external servers
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="p-3 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 w-fit mb-3 group-hover:scale-110 transition-transform">
                    <Table className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <CardTitle className="text-lg">Multi-Sheet Support</CardTitle>
                  <CardDescription>
                    Handles workbooks with multiple sheets, each converted to separate objects
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* How it Works */}
            <Card className="max-w-3xl mx-auto">
              <CardHeader className="text-center">
                <CardTitle>How It Works</CardTitle>
                <CardDescription>Three simple steps to convert your files</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">1</span>
                    </div>
                    <h4 className="font-semibold mb-1">Upload File</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Drag & drop or click to select your Excel or CSV file
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl font-bold text-teal-600 dark:text-teal-400">2</span>
                    </div>
                    <h4 className="font-semibold mb-1">Auto Convert</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      The file is automatically processed and converted to JSON
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl font-bold text-cyan-600 dark:text-cyan-400">3</span>
                    </div>
                    <h4 className="font-semibold mb-1">Download</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Copy the JSON or download it as a file to use anywhere
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Result Tab */}
          <TabsContent value="result" className="space-y-6">
            {isConverting ? (
              <Card className="max-w-4xl mx-auto">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                    <div className="relative p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                      <FileJson className="w-12 h-12 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mt-6">
                    Converting {fileName}...
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    Processing your spreadsheet data
                  </p>
                </CardContent>
              </Card>
            ) : convertedData ? (
              <Card className="max-w-4xl mx-auto">
                <CardHeader className="border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                          <FileJson className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{fileName}</CardTitle>
                          <div className="flex gap-4 mt-1 text-sm text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Layers className="w-3.5 h-3.5" />
                              {getSheetCount(convertedData)} sheets
                            </span>
                            <span className="flex items-center gap-1">
                              <Table className="w-3.5 h-3.5" />
                              {getRowCount(convertedData)} rows
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleCopy}>
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 mr-1.5" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1.5" />
                            Copy JSON
                          </>
                        )}
                      </Button>
                      <Button size="sm" onClick={handleDownload} className="bg-emerald-600 hover:bg-emerald-700">
                        <Download className="w-4 h-4 mr-1.5" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    <pre className="p-6 text-sm font-mono text-slate-700 dark:text-slate-300 leading-relaxed">
                      {JSON.stringify(convertedData, null, 2)}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : (
              <Card className="max-w-4xl mx-auto">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                    <FileCode className="w-12 h-12 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
                    No Conversion Result
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-4">
                    Upload a file to see the JSON output here
                  </p>
                  <Button onClick={() => setActiveTab("converter")} variant="outline">
                    <Upload className="w-4 h-4 mr-1.5" />
                    Go to Converter
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Conversion History</CardTitle>
                    <CardDescription>
                      View and manage your past file conversions
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {history.length} records
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingHistory ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-20 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"
                      />
                    ))}
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full inline-block mb-4">
                      <Clock className="w-8 h-8 text-slate-400" />
                    </div>
                    <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">
                      No History Yet
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                      Your converted files will appear here
                    </p>
                    <Button onClick={() => setActiveTab("converter")} variant="outline">
                      <Upload className="w-4 h-4 mr-1.5" />
                      Convert a File
                    </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-3">
                      {history.map((record) => (
                        <div
                          key={record.id}
                          className={`p-4 rounded-xl border bg-white dark:bg-slate-900 transition-all hover:shadow-md cursor-pointer ${
                            viewingHistoryId === record.id
                              ? "ring-2 ring-emerald-500 border-emerald-200 dark:border-emerald-800"
                              : "border-slate-200 dark:border-slate-700"
                          }`}
                          onClick={() => handleViewHistory(record)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 shrink-0">
                                <FileJson className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                                  {record.originalFileName}
                                </p>
                                <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                                  <span className="flex items-center gap-1">
                                    <HardDrive className="w-3 h-3" />
                                    {formatFileSize(record.fileSize)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Layers className="w-3 h-3" />
                                    {record.sheetsCount} sheets
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDate(record.createdAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewHistory(record);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteHistory(record.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-slate-900 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <FileJson className="w-4 h-4" />
              <span>Excel to JSON Converter</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Fast & Secure
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Free Forever
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
