import { useState } from "react";
import {
    Card,
    Table,
    TableHead,
    TableHeadCell,
    TableBody,
    TableRow,
    TableCell,
    Badge,
    Alert,
    Button,
} from "flowbite-react";
import {
    RiEqualizerLine,
    RiShieldFlashLine,
    RiFileCopyLine,
    RiCheckLine,
    RiExternalLinkLine, // Added for the docs link
} from "react-icons/ri";

const DebugPage = () => {
    const [copied, setCopied] = useState(false);
    const renderValue = (val) => {
        if (val === "true" || val === true)
            return <Badge color="success">TRUE</Badge>;
        if (val === "false" || val === false)
            return <Badge color="failure">FALSE</Badge>;
        if (!val || val.trim?.() === "") return <Badge color="gray">EMPTY</Badge>;
        return (
            <code className="text-xs break-all bg-gray-100 dark:bg-gray-700 p-1 rounded">
                {val}
            </code>
        );
    };

    const copyToClipboard = () => {
        const envData = Object.entries(import.meta.env)
            .map(([key, val]) => `${key}=${val}`)
            .join("\n");

        const markdown = `### Environment Variables\n\`\`\`text\n${envData}\n\`\`\``;

        navigator.clipboard.writeText(markdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
                    Debug
                </h1>
                <a 
                    href="https://booklogr.app/docs/Getting%20started" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline dark:text-blue-500"
                >
                    <RiExternalLinkLine /> Documentation
                </a>
            </div>

            <Alert color="failure" icon={RiShieldFlashLine}>
                <span className="font-medium">Security Notice:</span> This page is visible because
                <code className="mx-2 bg-gray-200 text-black">
                    VITE_DEBUG=true
                </code>
                Disable this in production unless actively troubleshooting.
            </Alert>

            <Card>
                <div className="flex flex-row justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2 dark:text-white">
                        <RiEqualizerLine /> Environment Variables
                    </h2>
                    <Button color={copied ? "green" : "light"} size="sm" onClick={copyToClipboard} className="flex items-center">
                        {copied ? (
                            <RiCheckLine className="mr-2 h-4 w-4" />
                        ) : (
                            <RiFileCopyLine className="mr-2 h-4 w-4" />
                        )}
                        {copied ? "Copied!" : "Copy"}
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <Table hoverable striped>
                        <TableHead>
                            <TableHeadCell>Key</TableHeadCell>
                            <TableHeadCell>Value</TableHeadCell>
                        </TableHead>
                        <TableBody className="divide-y">
                            {Object.entries(import.meta.env).map(([key, value]) => (
                                <TableRow key={key}>
                                    <TableCell className="font-mono text-xs font-bold">
                                        {key}
                                    </TableCell>
                                    <TableCell>{renderValue(value)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
};

export default DebugPage;