  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Test> }) => 
      apiRequest(`/api/tests/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tests"] });
      toast({ title: "Test updated successfully" });
      setIsEditDialogOpen(false);
      setEditingTest(null);
    },
    onError: () => {
      toast({ title: "Failed to update test", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest(`/api/tests/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tests"] });
      toast({ title: "Test deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete test", variant: "destructive" });
    },
  });

  const { data: tests = [], isLoading } = useQuery<Test[]>({
    queryKey: ["/api/tests"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: sites = [] } = useQuery<Site[]>({
    queryKey: ["/api/sites"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertTest) => apiRequest("/api/tests", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tests"] });
      toast({ title: "Test created successfully" });
      setIsCreateDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to create test", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => apiRequest(`/api/tests/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tests"] });
      toast({ title: "Test deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete test", variant: "destructive" });
    },
  });

  const handleCreateTest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const findingsText = formData.get("findings") as string || "";
    const data: InsertTest = {
      clientId: formData.get("clientId") as string,
      siteId: formData.get("siteId") as string || null,
      testType: formData.get("testType") as string,
      status: formData.get("status") as string,
      severity: formData.get("severity") as string || null,
      summary: formData.get("summary") as string || null,
      findings: findingsText ? { details: findingsText } : null,
      vulnerabilitiesFound: parseInt(formData.get("vulnerabilitiesFound") as string) || 0,
      criticalCount: parseInt(formData.get("criticalCount") as string) || 0,
      highCount: parseInt(formData.get("highCount") as string) || 0,
      mediumCount: parseInt(formData.get("mediumCount") as string) || 0,
      lowCount: parseInt(formData.get("lowCount") as string) || 0,
      executedBy: null,
      completedAt: null,
    };
    createMutation.mutate(data);
  };

  const handleEditTest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTest) return;
    const formData = new FormData(e.currentTarget);
    const findingsText = formData.get("findings") as string || "";
    const data: Partial<Test> = {
      summary: formData.get("summary") as string || null,
      testType: formData.get("testType") as string,
      status: formData.get("status") as string,
      severity: formData.get("severity") as string || null,
      findings: findingsText ? { details: findingsText } : null,
      vulnerabilitiesFound: parseInt(formData.get("vulnerabilitiesFound") as string) || 0,
      criticalCount: parseInt(formData.get("criticalCount") as string) || 0,
      highCount: parseInt(formData.get("highCount") as string) || 0,
      mediumCount: parseInt(formData.get("mediumCount") as string) || 0,
      lowCount: parseInt(formData.get("lowCount") as string) || 0,
    };
    updateMutation.mutate({ id: editingTest.id, data });
  };

  const filteredTests = tests.filter((test) => {
    const matchesSearch = test.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         test.testType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || test.status === statusFilter;
    const matchesClient = clientFilter === "all" || test.clientId === clientFilter;
    
    return matchesSearch && matchesStatus && matchesClient;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "in-progress":
        return "secondary";
      case "pending":
        return "outline";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "failed":
        return <XCircle className="w-4 h-4" />;
      case "in-progress":
        return <Shield className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (count: number, severity: string) => {
    if (count === 0) return "outline";
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-6 space-y-8">
        <AnimatedContainer direction="up" delay={0}>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <motion.h1
                className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, delay: 0.3 }}
              >
                <Shield className="w-10 h-10 text-primary" />
                Security <span className="bg-gradient-to-r from-primary via-blue-500 to-purple bg-clip-text text-transparent">Tests</span>
              </motion.h1>
              <motion.p
                className="text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
              >
                Comprehensive tracking of penetration tests, scans, and security assessments
              </motion.p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-test" className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Test
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Security Test</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTest} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientId">Client</Label>
                      <Select name="clientId" required>
                        <SelectTrigger data-testid="select-client">
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="siteId">Site (Optional)</Label>
                      <Select name="siteId">
                        <SelectTrigger data-testid="select-site">
                          <SelectValue placeholder="Select site" />
                        </SelectTrigger>
                        <SelectContent>
                          {sites.map((site) => (
                            <SelectItem key={site.id} value={site.id}>
                              {site.url}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="summary">Summary</Label>
                    <Input id="summary" name="summary" placeholder="Brief summary of the test" required data-testid="input-summary" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="testType">Test Type</Label>
                      <Input id="testType" name="testType" placeholder="e.g., Penetration Test" required data-testid="input-type" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select name="status" defaultValue="pending">
                        <SelectTrigger data-testid="select-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="severity">Severity</Label>
                      <Select name="severity">
                        <SelectTrigger data-testid="select-severity">
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="criticalCount">Critical</Label>
                      <Input id="criticalCount" name="criticalCount" type="number" defaultValue="0" min="0" data-testid="input-critical" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="highCount">High</Label>
                      <Input id="highCount" name="highCount" type="number" defaultValue="0" min="0" data-testid="input-high" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mediumCount">Medium</Label>
                      <Input id="mediumCount" name="mediumCount" type="number" defaultValue="0" min="0" data-testid="input-medium" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lowCount">Low</Label>
                      <Input id="lowCount" name="lowCount" type="number" defaultValue="0" min="0" data-testid="input-low" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vulnerabilitiesFound">Total</Label>
                      <Input id="vulnerabilitiesFound" name="vulnerabilitiesFound" type="number" defaultValue="0" min="0" data-testid="input-total" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="findings">Findings</Label>
                    <Textarea id="findings" name="findings" placeholder="Detailed findings and observations..." rows={4} data-testid="input-findings" />
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} data-testid="button-cancel">
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending} data-testid="button-save">
                      {createMutation.isPending ? "Creating..." : "Create Test"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </AnimatedContainer>

        <AnimatedContainer direction="up" delay={0.1}>
          <GlassCard>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tests by name, type, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48" data-testid="select-filter-status">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="w-full md:w-48" data-testid="select-filter-client">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </GlassCard>
        </AnimatedContainer>

        <div className="grid grid-cols-1 gap-6">
          {filteredTests.length === 0 && (
            <AnimatedContainer direction="up" delay={0.2}>
              <GlassCard>
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Tests Found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || statusFilter !== "all" || clientFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Create your first security test to get started"}
                  </p>
                </div>
              </GlassCard>
            </AnimatedContainer>
          )}
          {filteredTests.map((test, index) => {
            const site = sites.find(s => s.id === test.siteId);
            const client = clients.find(c => c.id === test.clientId);
            const findingsData = test.findings as { details?: string } | null;
            
            return (
              <AnimatedContainer key={test.id} direction="up" delay={0.2 + index * 0.05}>
                <GlassCard>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-xl font-semibold" data-testid={`text-test-summary-${test.id}`}>
                            {test.summary || "Untitled Test"}
                          </h3>
                          <Badge variant={getStatusColor(test.status)} className="gap-1" data-testid={`badge-status-${test.id}`}>
                            {getStatusIcon(test.status)}
                            {test.status}
                          </Badge>
                          {test.severity && (
                            <Badge variant={getSeverityColor(1, test.severity)} data-testid={`badge-severity-${test.id}`}>
                              {test.severity}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span data-testid={`text-date-${test.id}`}>
                              {format(new Date(test.startedAt), "MMM dd, yyyy 'at' HH:mm")}
                            </span>
                          </div>
                          {client && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Client:</span>
                              <span data-testid={`text-client-${test.id}`}>{client.name}</span>
                            </div>
                          )}
                          {site && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Site:</span>
                              <span data-testid={`text-site-${test.id}`}>{site.url}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteMutation.mutate(test.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-${test.id}`}
                      >
                        Delete
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" data-testid={`badge-type-${test.id}`}>{test.testType}</Badge>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        {test.vulnerabilitiesFound} vulnerabilities found
                      </span>
                    </div>

                    {test.vulnerabilitiesFound > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {test.criticalCount > 0 && (
                          <Badge variant={getSeverityColor(test.criticalCount, "critical")} data-testid={`badge-critical-${test.id}`}>
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {test.criticalCount} Critical
                          </Badge>
                        )}
                        {test.highCount > 0 && (
                          <Badge variant={getSeverityColor(test.highCount, "high")} data-testid={`badge-high-${test.id}`}>
                            {test.highCount} High
                          </Badge>
                        )}
                        {test.mediumCount > 0 && (
                          <Badge variant={getSeverityColor(test.mediumCount, "medium")} data-testid={`badge-medium-${test.id}`}>
                            {test.mediumCount} Medium
                          </Badge>
                        )}
                        {test.lowCount > 0 && (
                          <Badge variant={getSeverityColor(test.lowCount, "low")} data-testid={`badge-low-${test.id}`}>
                            {test.lowCount} Low
                          </Badge>
                        )}
                      </div>
                    )}

                    {findingsData?.details && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Findings:</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap" data-testid={`text-findings-${test.id}`}>
                          {findingsData.details}
                        </p>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </AnimatedContainer>
            );
          })}
        </div>
      </div>
    </div>
  );
}
