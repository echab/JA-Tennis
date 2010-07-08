using System;
using System.Xml;
using System.Xml.Linq;
using JA_Tennis.Helpers;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace JA_Tennis_UnitTest
{
    public static class AssertXml
    {
        public static void AreEqual(string expected, string actual, string message, params object[] parameters)
        {
            AssertXml.AreEqual(XElement.Parse(expected), XElement.Parse(actual), message, parameters);
        }

        public static void AreEqual(XElement expected, XElement actual, string message, params object[] parameters)
        {
            Assert.IsNotNull(actual);
            Assert.IsNotNull(expected);

            //Node name
            Assert.AreEqual<string>(expected.Name.LocalName, actual.Name.LocalName, "Element Name");
            Assert.AreEqual<string>(expected.Name.NamespaceName, actual.Name.NamespaceName, "Element Namespace");

            //Attributes
            var expectedAttributes = expected.Attributes().Where((x) => !x.IsNamespaceDeclaration);
            var actualAttributes = actual.Attributes().Where((x) => !x.IsNamespaceDeclaration);
            Assert.AreEqual<int>(expectedAttributes.Count(), actualAttributes.Count(), "Attribute count");
            foreach (XAttribute actualAttribute in actualAttributes)
            {
                AssertXml.AreEqual(expected.Attribute(actualAttribute.Name), actualAttribute, "Attribute", null);
            }

            //Child Elements and Texts
            Assert.AreEqual<bool>(expected.HasElements, actual.HasElements, "HasElements");
            Assert.AreEqual<int>(expected.Elements().Count(), actual.Elements().Count(), "Child Element count");

            Predicate<XNode> IsElementOrTextNotEmpty = (x) => x.NodeType == XmlNodeType.Element
                   || (x.NodeType == XmlNodeType.Text && !string.IsNullOrWhiteSpace((x as XText).Value));

            var actualNodes = actual.Nodes().Where(IsElementOrTextNotEmpty);
            var expectedNodes = expected.Nodes().Where(IsElementOrTextNotEmpty);
            var expectedNodeEnumerator = expectedNodes.GetEnumerator();
            foreach (XNode actualNode in actualNodes)
            {
                Assert.IsTrue(expectedNodeEnumerator.MoveNext());
                XNode expectedNode = expectedNodeEnumerator.Current;

                Assert.AreEqual<XmlNodeType>(expectedNode.NodeType, actualNode.NodeType, "Node type");
                if (actualNode.NodeType == XmlNodeType.Element)
                {
                    AssertXml.AreEqual(expectedNode as XElement, actualNode as XElement, "Child Node");
                }
                if (actualNode.NodeType == XmlNodeType.Text)
                {
                    Assert.AreEqual<string>((expectedNode as XText).Value, (actualNode as XText).Value, "Text content");
                }
            }

        }

        public static void AreEqual(XAttribute expected, XAttribute actual, string message, params object[] parameters)
        {
            Assert.IsNotNull(actual);
            Assert.IsNotNull(expected);
            Assert.AreEqual<string>(expected.Name.LocalName, actual.Name.LocalName, " Attribute Name");
            Assert.AreEqual<string>(expected.Name.NamespaceName, actual.Name.NamespaceName, actual.Name.LocalName + " Attribute Namespace");
            Assert.AreEqual<string>(expected.Value, actual.Value, actual.Name.LocalName + " Attribute Value");
        }
    }
}
