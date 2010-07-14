using System;
using System.Windows;
using System.Windows.Automation.Peers;
using System.Windows.Automation.Provider;
using System.Windows.Controls;
using System.Windows.Input;

namespace JA_Tennis.Helpers
{

    /// <summary>
    /// Xaml extensions for Silverlight 4
    /// <example>Declare the namespace as <code><... xmlns:h="clr-namespace:JA_Tennis.Helpers"></code>.</example>
    /// </summary>
    public static class XamlHelper
    {
        //see http://azurecoding.net/blogs/icbtw/archive/2009/09/02/xaml-default-button.aspx
        //see http://www.cauldwell.net/patrick/blog/DefaultButtonSemanticsInSilverlightRevisited.aspx

        #region IsDefault attached property
        /// <summary>
        /// IsDefault emulation for Silverlight 4
        /// <example><code><Button Content="Ok" h:XamlHelper:IsDefault="True" /></code></example>
        /// </summary>
        public static readonly DependencyProperty IsDefaultProperty = DependencyProperty.RegisterAttached(
            "IsDefault",
            typeof(bool),
            typeof(XamlHelper),
            new PropertyMetadata(
                false,  //Default value
                OnIsDefaultChanged
            )
        );
        public static bool GetIsDefault(DependencyObject d)
        {
            return (bool)d.GetValue(IsDefaultProperty);
        }
        public static void SetIsDefault(DependencyObject d, bool value)
        {
            d.SetValue(IsDefaultProperty, value);
        }

        private static void OnIsDefaultChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            bool isDefault = (bool)e.NewValue;
            Console.WriteLine("OnIsDefaultChanged");

            Button button = d as Button;
            if (button != null)
            {
                Action InitIsDefault = () =>
                {
                    UIElement form2 = GetParentForm(button);
                    if (isDefault)
                    {
                        SetDefaultButton(form2, button);
                        form2.KeyUp += button_KeyUp;
                    }
                    else
                    {
                        SetDefaultButton(form2, null);
                        form2.KeyUp -= button_KeyUp;
                    }
                };

                UIElement form = GetParentForm(button);
                if (form != null)
                {
                    InitIsDefault();
                }
                else
                {
                    button.Loaded += (s, args) => InitIsDefault();
                }
            }
        }

        static void button_KeyUp(object sender, KeyEventArgs e)
        {
            UIElement form = sender as UIElement;

            switch (e.Key)
            {
                case Key.Enter:
                    Button DefaultButton = GetDefaultButton(form);
                    if (DefaultButton != null && DefaultButton.IsEnabled)
                    {
                        //Click on the button
                        ButtonAutomationPeer peer = new ButtonAutomationPeer(DefaultButton);
                        IInvokeProvider ip = (IInvokeProvider)peer;
                        ip.Invoke();
                    }
                    break;
                case Key.Escape:
                    Button CancelButton = GetCancelButton(form);
                    if (CancelButton != null && CancelButton.IsEnabled)
                    {
                        //Click on the button
                        ButtonAutomationPeer peer = new ButtonAutomationPeer(CancelButton);
                        IInvokeProvider ip = (IInvokeProvider)peer;
                        ip.Invoke();
                    }
                    break;
            }
        }


        public static readonly DependencyProperty DefaultButtonProperty = DependencyProperty.RegisterAttached(
            "DefaultButton",
            typeof(Button),
            typeof(XamlHelper),
            new PropertyMetadata(
                null  //Default value
            )
        );
        public static Button GetDefaultButton(DependencyObject d)
        {
            return (Button)d.GetValue(DefaultButtonProperty);
        }
        public static void SetDefaultButton(DependencyObject d, Button value)
        {
            d.SetValue(DefaultButtonProperty, value);
        }
        #endregion IsDefault

        #region IsCancel attached property
        /// <summary>
        /// IsCancel emulation for Silverlight 4
        /// <example><code><Button Content="Cancel" h:XamlHelper:IsCancel="True" /></code></example>
        /// </summary>
        public static readonly DependencyProperty IsCancelProperty = DependencyProperty.RegisterAttached(
            "IsCancel",
            typeof(bool),
            typeof(XamlHelper),
            new PropertyMetadata(
                false,  //Cancel value
                OnIsCancelChanged
            )
        );
        public static bool GetIsCancel(DependencyObject d)
        {
            return (bool)d.GetValue(IsCancelProperty);
        }
        public static void SetIsCancel(DependencyObject d, bool value)
        {
            d.SetValue(IsCancelProperty, value);
        }

        private static void OnIsCancelChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
        {
            bool isCancel = (bool)e.NewValue;
            Console.WriteLine("OnIsCancelChanged");

            Button button = d as Button;
            if (button != null)
            {
                Action InitIsCancel = () =>
                {
                    UIElement form2 = GetParentForm(button);
                    if (isCancel)
                    {
                        SetCancelButton(form2, button);
                        form2.KeyUp += button_KeyUp;
                    }
                    else
                    {
                        SetCancelButton(form2, null);
                        form2.KeyUp -= button_KeyUp;
                    }
                };

                UIElement form = GetParentForm(button);
                if (form != null)
                {
                    InitIsCancel();
                }
                else
                {
                    button.Loaded += (s, args) => InitIsCancel();
                }
            }
        }

        public static UIElement GetParentForm(UIElement element)
        {
            //return element.Parent as UIElement;
            return App.Current.RootVisual;
        }

        public static readonly DependencyProperty CancelButtonProperty = DependencyProperty.RegisterAttached(
            "CancelButton",
            typeof(Button),
            typeof(XamlHelper),
            new PropertyMetadata(
                null  //Cancel value
            )
        );
        public static Button GetCancelButton(DependencyObject d)
        {
            return (Button)d.GetValue(CancelButtonProperty);
        }
        public static void SetCancelButton(DependencyObject d, Button value)
        {
            d.SetValue(CancelButtonProperty, value);
        }
        #endregion IsCancel
    }
}
