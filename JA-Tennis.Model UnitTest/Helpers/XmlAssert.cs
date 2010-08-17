using System;
using System.Linq;
using System.Xml;
using System.Xml.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace JA_Tennis_UnitTest
{
    //TODO validate against a XSD schema.

    /// <summary>
    /// Static class for XML unit testing assertions.
    /// </summary>
    public static class XmlAssert
    {
        static XName XmlSpaceName = XNamespace.Xml + "space";

        /// <summary>
        /// Compare two xml <see cref="string"/> elements, ignoring comments and spaces.
        /// </summary>
        /// <param name="expected"></param>
        /// <param name="actual"></param>
        /// <param name="bRecursively">Set to <see cref="true"/> to compare children nodes recursively.</param>
        /// <param name="message"></param>
        /// <param name="parameters"></param>
        public static void AreEqual(string expected, string actual, bool bRecursively, string message, params object[] parameters)
        {
            XElement expectedElement = null;
            XElement actualElement = null;

            try
            {
                expectedElement = XElement.Parse(expected);
            }
            catch (Exception ex)
            {
                throw new Exception( string.Format( "Error parsing expected string {0}", ex.Message));
            }

            try
            {
                actualElement = XElement.Parse(actual);
            }
            catch (Exception ex)
            {
                throw new Exception(string.Format("Error parsing actual string {0}", ex.Message));
            }

            XmlAssert.AreEqual(expectedElement, actualElement, bRecursively, message, parameters);
        }
        public static void AreEqual(string expected, XElement actual, bool bRecursively, string message, params object[] parameters)
        {
            XmlAssert.AreEqual(XElement.Parse(expected), actual, bRecursively, message, parameters);
        }
        public static void AreEqual(XElement expected, string actual, bool bRecursively, string message, params object[] parameters)
        {
            XmlAssert.AreEqual(expected, XElement.Parse(actual), bRecursively, message, parameters);
        }

        /// <summary>
        /// Compare two <see cref="XElement"/> elements, ignoring comments and spaces.
        /// </summary>
        /// <param name="expected"></param>
        /// <param name="actual"></param>
        /// <param name="bRecursively">Set to <see cref="true"/> to compare children nodes recursively.</param>
        /// <param name="message"></param>
        /// <param name="parameters"></param>
        public static void AreEqual(XElement expected, XElement actual, bool bRecursively, string message, params object[] parameters)
        {
            Assert.IsNotNull(expected);
            Assert.IsNotNull(actual, "Missing Element {0}", expected.ToXPathString());

            //Node name
            Assert.AreEqual(expected.Name.LocalName, actual.Name.LocalName, "Name of {0}", expected.ToXPathString());
            Assert.AreEqual(expected.Name.NamespaceName, actual.Name.NamespaceName, "Namespace of {0}", expected.ToXPathString());

            //Attributes
            var expectedAttributes = expected.Attributes().Where((x) => !x.IsNamespaceDeclaration && x.Name != XmlSpaceName);
            var actualAttributes = actual.Attributes().Where((x) => !x.IsNamespaceDeclaration && x.Name != XmlSpaceName);
            Assert.AreEqual(expectedAttributes.Count(), actualAttributes.Count(), "Attribute count of {0}", expected.ToXPathString());
            foreach (XAttribute expectedAttribute in expectedAttributes)
            {
                XAttribute actualAttribute = actual.Attribute(expectedAttribute.Name);
                XmlAssert.AreEqual(expectedAttribute, actualAttribute, expectedAttribute.ToXPathString());
            }

            if (bRecursively)
            {
                //Child Elements and Texts
                Assert.AreEqual(expected.HasElements, actual.HasElements, "HasElements of {0}", expected.ToXPathString());
                Assert.AreEqual(expected.Elements().Count(), actual.Elements().Count(), "Child Element count of {0}", expected.ToXPathString());

                //Predicate<XNode> 
                Func<XNode,bool> IsElementOrTextNotEmpty = (x) => x.NodeType == XmlNodeType.Element
                       || (x.NodeType == XmlNodeType.Text && !string.IsNullOrWhiteSpace((x as XText).Value));

                var actualNodes = actual.Nodes().Where(IsElementOrTextNotEmpty);
                var actualNodeEnumerator = actualNodes.GetEnumerator();
                var expectedNodes = expected.Nodes().Where(IsElementOrTextNotEmpty);
                foreach (XNode expectedNode in expectedNodes)
                {
                    Assert.IsTrue(actualNodeEnumerator.MoveNext(), "Missing node {0}", expectedNode.ToXPathString());
                    XNode actualNode = actualNodeEnumerator.Current;

                    Assert.AreEqual<XmlNodeType>(expectedNode.NodeType, actualNode.NodeType, "Node type of {0}", expectedNode.ToXPathString());
                    if (actualNode.NodeType == XmlNodeType.Element)
                    {
                        XmlAssert.AreEqual(expectedNode as XElement, actualNode as XElement, bRecursively, expectedNode.ToXPathString());
                    }
                    if (actualNode.NodeType == XmlNodeType.Text)
                    {
                        XmlAssert.AreEqual(expectedNode as XText, actualNode as XText, expectedNode.ToXPathString());
                    }
                }
                Assert.IsFalse(actualNodeEnumerator.MoveNext(), "Too much node {0}", actualNodeEnumerator.Current.ToXPathString());
            }
        }

        /// <summary>
        /// Compare two <see cref="XAttribute"/> nodes.
        /// </summary>
        /// <param name="expected"></param>
        /// <param name="actual"></param>
        /// <param name="message"></param>
        /// <param name="parameters"></param>
        public static void AreEqual(XAttribute expected, XAttribute actual, string message, params object[] parameters)
        {
            Assert.IsNotNull(expected);
            Assert.IsNotNull(actual, "Missing Attribute {0}", expected.ToXPathString());
            Assert.AreEqual(expected.Name.LocalName, actual.Name.LocalName, "Attribute Name of {0}", expected.ToXPathString());
            Assert.AreEqual(expected.Name.NamespaceName, actual.Name.NamespaceName, "Attribute Namespace of {0}", expected.ToXPathString());
            Assert.AreEqual(expected.Value, actual.Value, "Attribute Value of {0}", expected.ToXPathString());
        }

        /// <summary>
        /// Compare two <see cref="XText"/> texts, ignoring spaces.
        /// </summary>
        /// <param name="expected"></param>
        /// <param name="actual"></param>
        /// <param name="message"></param>
        /// <param name="parameters"></param>
        public static void AreEqual(XText expected, XText actual, string message, params object[] parameters)
        {
            Assert.IsNotNull(expected);
            Assert.IsNotNull(actual, "Missing Text {0}", expected.ToXPathString());

            string expectedText = expected.Value;
            XAttribute expectedSpace = expected.Parent.Attribute(XmlSpaceName);
            if (expectedSpace == null || expectedSpace.Value != "preserve")
            {
                expectedText = expectedText.Trim();
            }

            string actualText = actual.Value;
            XAttribute actualSpace = actual.Parent.Attribute(XmlSpaceName);
            if (actualSpace == null || actualSpace.Value != "preserve")
            {
                actualText = actualText.Trim();
            }

            Assert.AreEqual(expectedText, actualText, "Text content of {0}", expected.ToXPathString());
        }

        /// <summary>
        /// <see cref="XObject"/> extension to create XPath string to the node.
        /// </summary>
        /// <param name="obj"></param>
        /// <returns></returns>
        public static string ToXPathString(this XObject obj)
        {
            string s = string.Empty;
            for (XObject x = obj; x != null; x = x.Parent)
            {
                if (x is XElement)
                {
                    XElement element = x as XElement;
                    Func<XNode, bool> IsElementWithSameName = node => node is XElement && (node as XElement).Name == element.Name;

                    var ElementsBefore = element.NodesBeforeSelf().Where(IsElementWithSameName);
                    var ElementsAfter = element.NodesAfterSelf().Where(IsElementWithSameName);

                    s = "/" + element.Name.ToXPathString(element)
                        + (ElementsBefore.Count() + ElementsAfter.Count() > 0 ? "[" + ElementsBefore.Count() + "]" : "")
                        + s;
                }
                else if (x is XAttribute)
                {
                    s = "/@" + (x as XAttribute).Name.ToXPathString(x.Parent);
                }
                else if (x is XText)
                {
                    s = "/text()";
                }
                else if (x is XComment)
                {
                    s = "/comment()";
                }

                else if (x is XProcessingInstruction)
                {
                    s = "/processing-instruction()";
                }
                else
                {
                    s = "/*" + s;
                }
            }
            return s;
        }

        /// <summary>
        /// <see cref="XName"/> extension to create name string with namespace prefix if needed.
        /// </summary>
        /// <param name="name"></param>
        /// <param name="element"><see cref="XElemet"/> parent used as based namespace.</param>
        /// <returns></returns>
        public static string ToXPathString(this XName name, XElement element)
        {
            Assert.IsNotNull(name);

            string prefix = string.Empty;

            if (!string.IsNullOrEmpty(name.NamespaceName)
                && element != null
                && name.Namespace != element.GetDefaultNamespace()
            )
            {
                prefix = element.GetPrefixOfNamespace(name.Namespace) + ":";
            }

            return prefix + name.LocalName;
        }
    }
}
