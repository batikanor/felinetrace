import tempfile
import unittest
from pathlib import Path

import server


class AuditEngineTest(unittest.TestCase):
    def test_sample_dossier_without_ground_truth(self) -> None:
        analysis = server.analyze_files(
            server.load_directory(server.SAMPLE_DIR),
            "Muster Verpackungen FY 2025",
            "first",
        )

        self.assertEqual(analysis["dataset"]["files"], 35)
        self.assertEqual(analysis["dataset"]["kind"], "first")
        self.assertEqual(analysis["summary"]["report"], 4)
        self.assertEqual(analysis["summary"]["hold"], 1)
        self.assertGreaterEqual(analysis["summary"]["citations"], 10)
        self.assertSetEqual(
            {finding["scheme"] for finding in analysis["findings"]},
            {"vendor-control", "repair-capex", "cutoff", "split-payments"},
        )

    def test_unseen_dossier_uses_its_own_ids_amounts_and_threshold(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            files = {
                "policy.md": b"# Northstar Payments Ltd\nPayments at or above EUR 5,000 require second approval.\n",
                "master_changes.csv": (
                    b"vendor_id,vendor_name,created_by,approved_by,field,new_value\n"
                    b"700001,Nova Advisory Ltd,USR-77,USR-77,status,create\n"
                ),
                "goods_receipts.csv": b"vendor_id,goods_receipt,amount\n799999,GR-1,100\n",
                "permissions.csv": b"user_id,vendor,payment\nUSR-77,create,run\n",
                "vendor_ledger.csv": (
                    b"vendor_id,vendor_name,posting_date,amount,reference,posted_by\n"
                    b"700001,Nova Advisory Ltd,2026-01-02,15000,NOVA-1,USR-77\n"
                    b"700001,Nova Advisory Ltd,2026-01-03,15000,NOVA-2,USR-77\n"
                    b"700001,Nova Advisory Ltd,2026-01-04,15000,NOVA-3,USR-77\n"
                ),
                "general_ledger.csv": (
                    b"type,date,amount,account,user,reference\n"
                    b"payment,2026-02-10,4900,2000-700002,USR-88,SPLIT-9\n"
                    b"payment,2026-02-10,4850,2000-700002,USR-88,SPLIT-9\n"
                    b"payment,2026-02-10,4950,2000-700002,USR-88,SPLIT-9\n"
                ),
            }
            for name, content in files.items():
                (root / name).write_bytes(content)

            analysis = server.analyze_files(server.load_directory(root), "Independent fixture")

        findings = {finding["scheme"]: finding for finding in analysis["findings"]}
        self.assertEqual(analysis["dataset"]["company"], "Northstar Payments Ltd")
        self.assertIn("vendor-control", findings)
        self.assertIn("split-payments", findings)
        self.assertEqual(findings["vendor-control"]["entity"], "Nova Advisory Ltd")
        self.assertEqual(findings["vendor-control"]["amount"], "€45.000,00")
        self.assertEqual(findings["split-payments"]["amount"], "€14.700,00")
        self.assertIn("€5.000,00", findings["split-payments"]["explanation"])
        self.assertNotIn("MV-U", str(analysis))

    @unittest.skipUnless(server.FINAL_DIR.exists(), "final dossier is local-only")
    def test_final_dossier_reconciles_the_delivered_population(self) -> None:
        analysis = server.analyze_final_directory(force=True)
        findings = {finding["scheme"]: finding for finding in analysis["findings"]}

        self.assertEqual(analysis["dataset"]["kind"], "final")
        self.assertEqual(analysis["dataset"]["files"], 44)
        self.assertEqual(analysis["summary"], {"report": 3, "hold": 1, "citations": 15})
        self.assertEqual(findings["export-integrity"]["amount"], "€5.197.000,00")
        self.assertIn("1,083,723 − 1,083,713 = 10", findings["export-integrity"]["calculation"])
        self.assertEqual(findings["related-party-cash-pool"]["amount"], "€2.197.000,00")
        self.assertEqual(findings["unapproved-director-loan"]["amount"], "€3.000.000,00")
        self.assertIn("GEBUCHT OHNE FREIGABE", findings["unapproved-director-loan"]["explanation"])
        self.assertEqual(analysis["holds"][0]["scheme"], "bill-and-hold-cleared")
        self.assertIn("0 shipping rows", analysis["holds"][0]["calculation"])


if __name__ == "__main__":
    unittest.main()
